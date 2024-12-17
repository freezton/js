type MutableUser = {
    id: string;
    login: string;
    password: string;
};

export type User = Readonly<MutableUser>;