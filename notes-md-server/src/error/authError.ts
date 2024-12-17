export class AuthError extends Error {
    constructor(msg: string) {
        super();
        this.message = msg;
    }
}