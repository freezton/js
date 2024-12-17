import path from "path";
import fs from "fs";

export const STORAGE_PATH = path.resolve("storage");

export const NOTES_PATH = path.join(STORAGE_PATH, "notes");

export const IMAGES_PATH = path.join(STORAGE_PATH, "images");

export const ensureUserFolderExists = (userId: string) => {
	const userNotesPath = path.join(NOTES_PATH, userId);
	if (!fs.existsSync(userNotesPath)) {
		fs.mkdirSync(userNotesPath, { recursive: true });
	}
	return userNotesPath;
};

export const ensureUserImageFolderExists = (userId: string) => {
	const userNotesPath = path.join(IMAGES_PATH, userId);
	console.log(userNotesPath);
	if (!fs.existsSync(userNotesPath)) {
		fs.mkdirSync(userNotesPath, { recursive: true });
	}
	return userNotesPath;
};
