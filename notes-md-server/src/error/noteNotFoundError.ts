export class NoteNotFoundError extends Error {
    constructor() {
        super();
        this.message = 'Note not found';
    }
}