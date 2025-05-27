
import Chef from "../Models/chefModel.js";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";

export const uploadCertificateController = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const buffer = req.file.buffer;

    const result = await uploadToCloudinary(buffer, {
      folder: "certificates",
      resource_type: "auto",
    });

    const updatedChef = await Chef.findOneAndUpdate(
      { userId },
      { certificate: result.secure_url },
      { new: true }
    );

    res.status(200).json({ message: "Certificate uploaded", chef: updatedChef });
  } catch (error) {
    console.error("Certificate Upload Error:", error);
    res.status(500).json({ error: "Certificate upload failed" });
  }
};
