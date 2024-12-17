export const SOCKET_MESSAGES = {
    CONNECTION: 'connection',
    DISCONNECT: 'disconnect',

    // Receives
	GET_NOTE: 'get-note',
	GET_ALL_NOTES: 'get-all-notes',
	CREATE_NOTE: 'create-note',
    UPDATE_NOTE: 'update-note',
    DELETE_NOTE: 'delete-note',

    // Sends
    RECEIVED_ALL_NOTES: 'received-all-notes',
    RECEIVED_NOTE: 'received-note',
    CREATED_NOTE: 'created-note',
    UPDATED_NOTE: 'updated-note',
    DELETED_NOTE: 'deleted-note',
    // LIST_NOTES: 'list-notes',

    // Util
    ERROR: 'error',
    SUCCESS: 'success',
    AUTH_ERROR: 'auth-error',
};