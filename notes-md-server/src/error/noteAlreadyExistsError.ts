export class NoteAlreadyExistsError extends Error {
    constructor() {
        super();
        this.message = 'Note already exists';
    }
}