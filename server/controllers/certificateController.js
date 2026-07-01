import Certificate from "../models/Certificate.js";

export const getCertificates = async (req, res) => {
    try {
        const certificates = await Certificate.find().sort({ createdAt: -1 });
        res.json({ certificates });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createCertificate = async (req, res) => {
    try {
        const certificate = await Certificate.create(req.body);
        res.status(201).json(certificate);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateCertificate = async (req, res) => {
    try {
        const certificate = await Certificate.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json(certificate);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteCertificate = async (req, res) => {
    await Certificate.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
};