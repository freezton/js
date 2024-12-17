import { SOCKET_MESSAGES } from "@/constants/socketMessages";
import { Server, Socket } from "socket.io";
import NoteService from "@/service/note"
import { AuthError } from "@/error/authError";
import AuthService from "@/service/auth"

export const socketConnectedListener = (io: Server) => (socket: Socket) => {
	const accessToken: string =
		socket.request.headers.cookie
			?.split("; ")
			.find(row =>
				row.startsWith(process.env["ACCESS_TOKEN_COOKIE_NAME"] || "")
			)
			?.split("=")[1] || "";

	socket.on(SOCKET_MESSAGES.GET_ALL_NOTES, async (userId: string) => {
		// console.log('Received GET_ALL_NOTES event with userId:', userId);
		try {
			// console.log('result');
			await AuthService.validateAccessToken(accessToken);
			const result = await NoteService.getAllNotes(userId);
			socket.emit(SOCKET_MESSAGES.RECEIVED_ALL_NOTES, result)
		} catch (e: unknown) {
			console.log('here')
			socket.emit(
			e instanceof AuthError
				? SOCKET_MESSAGES.AUTH_ERROR
				: SOCKET_MESSAGES.ERROR,
				(e as Error).message
			);
		}
	});

	socket.on(SOCKET_MESSAGES.GET_NOTE, async (userId: string, id: string) => {
		try {
			await AuthService.validateAccessToken(accessToken);
			const result = await NoteService.getNoteById(userId, id);
			socket.emit(SOCKET_MESSAGES.RECEIVED_NOTE, result);
		} catch (e: unknown) {
			socket.emit(
				e instanceof AuthError
					? SOCKET_MESSAGES.AUTH_ERROR
					: SOCKET_MESSAGES.ERROR,
					(e as Error).message
				);
		}
	});
	socket.on(SOCKET_MESSAGES.CREATE_NOTE, async (userId: string, title: string) => {
		try {
			await AuthService.validateAccessToken(accessToken);
			const result = await NoteService.createNote(userId, title);
			io.emit(SOCKET_MESSAGES.SUCCESS, result)
		} catch (e: unknown) {
			socket.emit(
				e instanceof AuthError
					? SOCKET_MESSAGES.AUTH_ERROR
					: SOCKET_MESSAGES.ERROR,
					(e as Error).message
				);
		}
	});
	socket.on(SOCKET_MESSAGES.UPDATE_NOTE, async (userId: string, id: string, title: string, content: string) => {
		try {
			await AuthService.validateAccessToken(accessToken);
			const result = await NoteService.updateNote(userId, id, title, content);
			io.emit(SOCKET_MESSAGES.UPDATED_NOTE, result)
		} catch (e: unknown) {
			socket.emit(
				e instanceof AuthError
					? SOCKET_MESSAGES.AUTH_ERROR
					: SOCKET_MESSAGES.ERROR,
					(e as Error).message
				);
		}
	});
	socket.on(SOCKET_MESSAGES.DELETE_NOTE, async (userId: string, id: string) => {
		try {
			await AuthService.validateAccessToken(accessToken);
			const result = await NoteService.deleteNote(userId, id);
			io.emit(SOCKET_MESSAGES.SUCCESS, result)
		} catch (e: unknown) {
			socket.emit(
				e instanceof AuthError
					? SOCKET_MESSAGES.AUTH_ERROR
					: SOCKET_MESSAGES.ERROR,
					(e as Error).message
				);
		}
	});
};
