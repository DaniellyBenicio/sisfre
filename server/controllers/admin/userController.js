import db from "../../models/index.js";
import bcrypt from "bcryptjs";

export const registerUser = async (req, res) => {
  const { email, username, accessType } = req.body;

  if (!email || !username || !accessType) {
    return res.status(400).json({
      error: "Email, nome e tipo de acesso são obrigatórios",
    });
  }
  if (
    !email.endsWith("@ifce.edu.br") &&
    !email.endsWith("@aluno.ifce.edu.br")
  ) {
    return res.status(400).json({
      error:
        "Apenas e-mails institucionais (@ifce.edu.br ou @aluno.ifce.edu.br) são permitidos",
    });
  }

  if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(username)) {
    return res.status(400).json({
      error: "O nome deve conter apenas letras (incluindo acentos) e espaços",
    });
  }

  try {
    const existingUser = await db.User.findOne({ where: { email } });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "E-mail já cadastrado. Tente outro." });
    }

    const defaultPassword = "123456"; //mudar posteriormente para primeiro acesso

    const newUser = await db.User.create({
      email,
      password: defaultPassword,
      username,
      accessType,
    });

    const createdUser = await db.User.findByPk(newUser.id, {
      attributes: { exclude: ["password"] },
    });

    res.status(201).json({
      message:
        "Usuário cadastrado com sucesso. Use a senha padrão '123456' para o primeiro login.",
      user: createdUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao cadastrar usuário" });
  }
};

export const updateUser = async (req, res) => {
  const { email, password, username, accessType } = req.body;
  const userId = req.params.id;

  if (!email && !password && !username && !accessType === undefined) {
    return res.status(400).json({
      error:
        "Pelo menos um campo (email, senha, nome, tipo de acesso deve ser fornecido para atualização",
    });
  }

  try {
    const user = await db.User.findByPk(userId, {
      attributes: { exclude: ["password"] },
    });
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    if (!user.isActive) {
      return res.status(400).json({
        error: "Não é possível editar um usuário inativo",
      });
    }

    if (email && email !== user.email) {
      if (
        !email.endsWith("@ifce.edu.br") &&
        !email.endsWith("@aluno.ifce.edu.br")
      ) {
        return res.status(400).json({
          error:
            "Apenas e-mails institucionais (@ifce.edu.br ou @aluno.ifce.edu.br) são permitidos",
        });
      }

      const existingUser = await db.User.findOne({ where: { email } });
      if (existingUser) {
        return res
          .status(400)
          .json({ error: "E-mail já cadastrado. Tente outro." });
      }
      user.email = email;
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    if (username) {
      user.username = username;
    }

    if (accessType) {
      user.accessType = accessType;
    }

    if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(username)) {
      return res.status(400).json({
        error: "O nome deve conter apenas letras (incluindo acentos) e espaços",
      });
    }

    await user.save();

    const userResponse = {
      id: user.id,
      username: user.username,
      acronym: user.acronym,
      email: user.email,
      accessType: user.accessType,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    res
      .status(200)
      .json({ message: "Usuário atualizado com sucesso", user: userResponse });
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar usuário" });
  }
};

export const getUsers = async (req, res) => {
  const { username, page = 1, limit = 10, order = "asc", isActive } = req.query;

  try {
    const offset = (page - 1) * limit;

    const where = {
      accessType: { [db.Sequelize.Op.ne]: "admin" },
    };

    if (username) {
      where.username = {
        [db.Sequelize.Op.like]: `%${username}%`,
      };
    }

    if (isActive !== undefined) {
      where.isActive = isActive === "true";
    }

    const { rows, count } = await db.User.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [["username", order === "asc" ? "ASC" : "DESC"]],
      attributes: {
        exclude: ["password"],
      },
    });

    res.json({
      users: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    console.error("Erro ao listar usuários:", error.message);
    res.status(500).json({ error: "Erro ao listar usuários" });
  }
};

export const getAllUsers = async (req, res) => {
  const { username, isActive } = req.query;

  try {
    const where = {
      accessType: { [db.Sequelize.Op.notIn]: ["admin"] },
    };

    if (username) {
      where.username = {
        [db.Sequelize.Op.like]: `%${username}%`,
      };
    }

    if (isActive !== undefined) {
      where.isActive = isActive === "true";
    }

    const users = await db.User.findAll({
      where,
      order: [["username", "ASC"]],
      attributes: { exclude: ["password"] },
    });

    res.json({ users });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Erro ao listar usuários" });
  }
};

export const getUserById = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await db.User.findByPk(userId, {
      attributes: { exclude: ["password"] },
    });
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar usuário" });
  }
};

export const deleteUser = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await db.User.findByPk(userId, {
      include: [
        {
          model: db.ClassScheduleDetail,
          as: "scheduleDetails",
          include: {
            model: db.ClassSchedule,
            as: "schedule",
            include: {
              model: db.Class,
              as: "class",
              include: {
                model: db.Course,
                as: "course",
                through: {
                  attributes: ["isActive"],
                  where: { isActive: true },
                },
              },
            },
          },
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    const accessType = user.accessType;

    if (user.isActive) {
      if (accessType === "Coordenador") {
        const cursoCoordenado = await db.Course.findOne({
          where: { coordinatorId: user.id },
        });

        if (cursoCoordenado) {
          return res.status(400).json({
            error:
              "Não é possível inativar: o coordenador está vinculado a um curso.",
          });
        }
      }

      if (accessType === "Professor") {
        const temTurmaAtiva = user.scheduleDetails.some((detail) => {
          return (
            detail.schedule?.class?.course &&
            detail.schedule.class.course.length > 0
          );
        });

        if (temTurmaAtiva) {
          return res.status(400).json({
            error:
              "Não é possível inativar: o professor possui aulas em turmas ativas.",
          });
        }
      }
    }

    user.isActive = !user.isActive;
    await user.save();

    const message = user.isActive
      ? "Usuário ativado com sucesso."
      : "Usuário inativado com sucesso.";

    res.status(200).json({
      message,
      user: { ...user.get(), password: undefined },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};
