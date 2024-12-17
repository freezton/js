export class ImageNotFoundError extends Error {
    constructor() {
        super();
        this.message = 'Image not found.';
    }
}