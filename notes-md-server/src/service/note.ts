import fs from "fs";
import path from "path";
import {
	STORAGE_PATH,
	NOTES_PATH,
	IMAGES_PATH,
	ensureUserFolderExists,
	ensureUserImageFolderExists,
} from "@/constants/paths";
import { NoteNotFoundError } from "@/error/noteNotFoundError";
import { NoteAlreadyExistsError } from "@/error/noteAlreadyExistsError";
import { NoteRepo } from "@/repository/noteRepo";
import mongoose from "mongoose";
import { ImageNotFoundError } from "@/error/imageNotFoundError";
import fileUpload from "express-fileupload";

class NoteService {
	async getNoteById(userId: string, noteId: string) {
		const note = await NoteRepo.findOne({ id: noteId, userId });
		if (!note) {
			throw new NoteNotFoundError();
		}

		const notePath = path.join(NOTES_PATH, userId, `${noteId}.md`);
		if (!fs.existsSync(notePath)) {
			await NoteRepo.deleteOne({ id: noteId, userId });
		}
		const content = fs.readFileSync(notePath, "utf-8");
		const { id, title, createdAt, updatedAt } = note;
		return { id, title, content, createdAt, updatedAt };
	}

	async getAllNotes(userId: string) {
		const notes = await NoteRepo.find({ userId }).select(
			"id title createdAt updatedAt"
		);
		return notes;
	}

	async createNote(userId: string, title: string) {
		const id = new mongoose.Types.ObjectId().toString();
		const note = await NoteRepo.create({ id, userId, title });

		const userNotesPath = ensureUserFolderExists(userId);
		const notePath = path.join(userNotesPath, `${id}.md`);
		const content = `# ${title}`;
		fs.writeFileSync(notePath, content);
		const { createdAt, updatedAt } = note;
		return { id, title, content, createdAt, updatedAt };
	}

	async updateNote(userId: string, id: string, title: string, content: string) {
		const note = await NoteRepo.findOneAndUpdate(
			{ id, userId },
			{ title, updatedAt: new Date() },
			{ new: true }
		);
		if (!note) {
			throw new NoteNotFoundError();
		}
		const notePath = path.join(NOTES_PATH, userId, `${id}.md`);
		fs.writeFileSync(notePath, content);
		return { id, title, content };
	}

	async deleteNote(userId: string, id: string) {
		const note = await NoteRepo.findOneAndDelete({ id, userId });
		if (!note) {
			throw new NoteNotFoundError();
		}
		const notePath = path.join(NOTES_PATH, userId, `${id}.md`);
		if (fs.existsSync(notePath)) {
			fs.unlinkSync(notePath);
		}
		return { message: "Note deleted!" };
	}

	async uploadImage(userId: string, file: fileUpload.UploadedFile) {
		const userImagesPath = ensureUserImageFolderExists(userId);

		const fileExtension = path.extname(file.name);
		const now = new Date();
		const timestamp = `${now.getFullYear()}-${String(
			now.getMonth() + 1
		).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}_${String(
			now.getHours()
		).padStart(2, "0")}-${String(now.getMinutes()).padStart(2, "0")}-${String(
			now.getSeconds()
		).padStart(2, "0")}`;

		const fileName = `${timestamp}_${new mongoose.Types.ObjectId()}${fileExtension}`;
		const filePath = path.join(userImagesPath, fileName);

		fs.writeFileSync(filePath, file.data);

		return { imageUrl: `/images/${fileName}` };
	}

	async getImage(userId: string, imageName: string) {
		const imagePath = ensureUserImageFolderExists(userId);
		return fs.readFileSync(path.join(imagePath, imageName));
	}

	async getAllImages(userId: string) {
		const userImagesPath = ensureUserImageFolderExists(userId);
		try {
			const imageFiles = await fs.promises.readdir(userImagesPath);

			return imageFiles;
		} catch (error) {
			throw new Error(`Failed to read images directory:`);
		}
	}

	async deleteImage(userId: string, imageId: string) {
		const userImagesPath = path.join(IMAGES_PATH, userId);
		if (!fs.existsSync(userImagesPath)) {
			throw new Error(`Directory for user ${userId} not found`);
		}
		try {
			const imageFiles = await fs.promises.readdir(userImagesPath);
			const fileToDelete = imageFiles.find((fileName) => fileName.includes(imageId));
			if (!fileToDelete) {
				throw new Error(`Image with ID ${imageId} not found`);
			}
			const filePath = path.join(userImagesPath, fileToDelete);
			await fs.promises.unlink(filePath);
	
			return { message: `Image ${imageId} deleted successfully` };
		} catch (error) {
			throw new Error(`Failed to delete image`);
		}
	}
	
}

export default new NoteService();
