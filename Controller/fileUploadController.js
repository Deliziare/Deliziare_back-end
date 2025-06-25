
import Chef from "../Models/chefModel.js";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";
import DeliveryBoy from "../Models/deliveryboyModel.js";

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



export const uploadDeliveryFileController = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const buffer = req.file.buffer;
    const originalName = req.file.originalname;

    const fileType = req.body.type; // should be "IDProof" or "license"
    if (!["IDProof", "license"].includes(fileType)) {
      return res.status(400).json({ error: "Invalid file type" });
    }

    // Detect file type from name (for .pdf)
    const isPDF = originalName.toLowerCase().endsWith('.pdf');

    const result = await uploadToCloudinary(buffer, {
      folder: "delivery_files",
      resource_type: isPDF ? "raw" : "auto", // Force "raw" for PDFs
    });

    // Dynamic field update
    const updateField = {};
    updateField[fileType] = result.secure_url;

    const updatedDeliveryBoy = await DeliveryBoy.findOneAndUpdate(
      { userId },
      updateField,
      { new: true }
    );

    return res.status(200).json({
      message: `${fileType} uploaded successfully`,
      [fileType]: result.secure_url,
    });
  } catch (error) {
    console.error("Delivery File Upload Error:", error);
    return res.status(500).json({ error: "Upload failed" });
  }
};
