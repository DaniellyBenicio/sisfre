import db from "../../models/index.js";
import { isInCampus } from "../../utils/locationUtils.js";
import QRCode from "qrcode";
import crypto from "crypto";

const qrCodes = new Map(); // memória temporária (Redis para produção)

export const registerByQrCode = async (req, res) => {
  const { token, userId, latitude, longitude } = req.body;

  const qrData = qrCodes.get(token);
  if (!qrData) {
    return res.status(400).json({ error: "QR Code inválido ou expirado." });
  }

  if (qrData.expiresAt < Date.now()) {
    qrCodes.delete(token);
    return res.status(410).json({ error: "QR Code expirado." });
  }

  if (!isInCampus({ latitude, longitude })) {
    return res.status(403).json({ error: "Você precisa estar no campus." });
  }

  const now = new Date();
  const date = now.toISOString().split("T")[0];
  const time = now.toTimeString().split(" ")[0];

  try {
    const frequency = await db.Frequency.create({
      userId,
      courseId: qrData.courseId,
      disciplineId: qrData.disciplineId,
      date,
      time,
      latitude,
      longitude,
    });

    res.status(201).json({ message: "Frequência registrada via QR Code.", frequency });
  } catch (err) {
    res.status(500).json({ error: "Erro ao registrar frequência.", details: err.message });
  }
};

export const getFrequencies = async (req, res) => {
  try {
    const frequencies = await db.Frequency.findAll({
      order: [["date", "DESC"], ["time", "DESC"]],
    });
    res.status(200).json(frequencies);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar frequências.", details: err.message });
  }
};

export const updateFrequency = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await db.Frequency.update(req.body, {
      where: { id },
    });

    if (updated[0] === 0) {
      return res.status(404).json({ error: "Frequência não encontrada." });
    }

    res.json({ message: "Frequência atualizada com sucesso." });
  } catch (err) {
    res.status(500).json({ error: "Erro ao atualizar frequência.", details: err.message });
  }
};

export const generateQrCode = async (req, res) => {
  const { courseId, disciplineId } = req.body;

  const token = crypto.randomBytes(16).toString("hex");
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutos

  qrCodes.set(token, { courseId, disciplineId, expiresAt });

  const qrData = JSON.stringify({ token });
  const qrImage = await QRCode.toDataURL(qrData);

  res.status(200).json({ qrImage, token, expiresAt });
};

export const getQrCodeImage = async (req, res) => {
  const { token } = req.params;

  const qrData = qrCodes.get(token);
  if (!qrData) {
    return res.status(404).json({ error: "QR Code não encontrado ou expirado." });
  }

  try {
    const qrPayload = JSON.stringify({ token });
    const buffer = await QRCode.toBuffer(qrPayload);

    res.set("Content-Type", "image/png");
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ error: "Erro ao gerar imagem do QR Code." });
  }
};

export const registerAbsenceWithCredit = async (req, res) => {
  const { userId, courseId, disciplineId, date, time, useCredit } = req.body;

  try {
    const professor = await db.User.findByPk(userId);
    if (!professor) {
      return res.status(404).json({ error: "Professor não encontrado." });
    }

    if (useCredit && professor.absenceCredits > 0) {
      professor.absenceCredits -= 1;
      await professor.save();
      return res.status(200).json({ message: "Falta registrada usando crédito. Nenhuma falta contabilizada." });
    }

    // Registra falta normalmente
    await db.Frequency.create({
      userId,
      courseId,
      disciplineId,
      date,
      time,
      isAbsence: true,
      latitude: null,
      longitude: null,
    });

    return res.status(201).json({ message: "Falta registrada." });
  } catch (err) {
    return res.status(500).json({ error: "Erro ao registrar falta." });
  }
};

export const getProfessorScheduleCourseDiscipline = async (req, res) => {
  const { userId } = req.params;

  try {
    const scheduleDetails = await db.ClassScheduleDetail.findAll({
      where: { userId },
      include: [
        { model: db.ClassSchedule, as: "schedule", include: [{ model: db.Course, as: "course", attributes: ["id", "name"] }] },
        { model: db.Discipline, as: "discipline", attributes: ["id", "name"] },
        { model: db.Hour, as: "hour", attributes: ["id", "hourStart", "hourEnd"] }
      ]
    });

    const result = scheduleDetails.map(detail => ({
      date: detail.date,
      hour: detail.hour,
      course: detail.schedule?.course,
      discipline: detail.discipline
    }));

    return res.status(200).json({ schedule: result });
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar horários do professor." });
  }
};


