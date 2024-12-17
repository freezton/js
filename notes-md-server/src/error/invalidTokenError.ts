export class InvalidTokenError extends Error {
    constructor(msg: string) {
        super();
        this.message = msg;
    }
}