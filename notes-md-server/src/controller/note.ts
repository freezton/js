import { Request, Response } from "express";
import { HttpStatus } from "http-status-ts";
import NoteService from "@/service/note";

class NoteController {
	async get(req: Request, res: Response) {
		const userId = req.headers["userId"] as string;
		const { id } = req.params;
		try {
			const note = await NoteService.getNoteById(userId, id);
			res.status(HttpStatus.OK).json(note);
		} catch (e: unknown) {
			res.status(HttpStatus.NOT_FOUND).json((e as Error).message);
		}
	}

	async getAll(req: Request, res: Response) {
		const userId = req.headers["userId"] as string;
		const notes = await NoteService.getAllNotes(userId);
		res.status(HttpStatus.OK).json(notes);
	}

	async create(req: Request, res: Response) {
		const userId = req.headers["userId"] as string;
		const { title, content } = JSON.parse(req.body.note);
		const note = await NoteService.createNote(userId, title);
		res.status(HttpStatus.CREATED).json(note);
	}

	async update(req: Request, res: Response) {
		const userId = req.headers["userId"] as string;
		const { id } = req.params;
		const { title, content } = JSON.parse(req.body.note);
		try {
			const { message } = await NoteService.updateNote(
				userId,
				id,
				title,
				content
			);
			res.status(HttpStatus.OK).json(message);
		} catch (e: unknown) {
			res.status(HttpStatus.NOT_FOUND).json((e as Error).message);
		}
	}

	async delete(req: Request, res: Response) {
		const userId = req.headers["userId"] as string;
		const { id } = req.params;
		try {
			const { message } = await NoteService.deleteNote(userId, id);
			res.status(HttpStatus.OK).json(message);
		} catch (e: unknown) {
			res.status(HttpStatus.NOT_FOUND).json((e as Error).message);
		}
	}

	async uploadImage(req: Request, res: Response) {
		const userId = req.headers["userId"] as string;
		const file = req.files?.file;
		if (!file) {
			res.status(HttpStatus.NOT_FOUND).json({ error: "No file provided" });
			return;
		}
		let uploadedFile;
		if (Array.isArray(file)) {
			uploadedFile = file[0];
		} else {
			uploadedFile = file;
		}
		const result = await NoteService.uploadImage(userId, uploadedFile);
		res.status(HttpStatus.CREATED).json(result);
	}

	async getImage(req: Request, res: Response) {
		const userId = req.headers["userId"] as string;
		const { id } = req.params;
		try {
			const image = await NoteService.getImage(userId, id);
			res.set("Content-Type", "image/jpeg");
			res.send(image);
		} catch (e: unknown) {
			res.status(HttpStatus.NOT_FOUND).json((e as Error).message);
		}
	}

	async getAllImages(req: Request, res: Response) {
		const userId = req.headers["userId"] as string;
		try {
			const notes = await NoteService.getAllImages(userId);
			res.status(HttpStatus.OK).json(notes);
		} catch (e: unknown) {
			res.status(HttpStatus.BAD_REQUEST).json((e as Error).message);
		}
	}

	async deleteImage(req: Request, res: Response) {
		const userId = req.headers["userId"] as string;
		const { id } = req.params;
		try {
			const { message } = await NoteService.deleteImage(userId, id);
			res.status(HttpStatus.OK).json(message);
		} catch (e: unknown) {
			res.status(HttpStatus.NOT_FOUND).json((e as Error).message);
		}
	}
}

export default new NoteController();
