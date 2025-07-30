import db from "../../models/index.js";
import { isInCampus } from "../../utils/locationUtils.js";

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
      courseClassId: qrData.courseClassId,
      date,
      time,
      latitude,
      longitude,
    });

    res.status(201).json({ message: "Frequência registrada via QR Code.", frequency });
  } catch (err) {
    res.status(500).json({ error: "Erro ao registrar frequência." });
  }
};

export const getFrequencies = async (req, res) => {
  try {
    const frequencies = await db.Frequency.findAll({
      include: ["professor", "disciplinaclasse"],
    });
    res.status(200).json(frequencies);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar frequências." });
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
    res.status(500).json({ error: "Erro ao atualizar frequência." });
  }
};

import QRCode from "qrcode";
import crypto from "crypto";

const qrCodes = new Map(); // memória temporária (Redis para produção)

export const generateQrCode = async (req, res) => {
  const { courseClassId } = req.body;

  const token = crypto.randomBytes(16).toString("hex");
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutos

  qrCodes.set(token, { courseClassId, expiresAt });

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


