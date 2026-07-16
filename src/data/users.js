// In-memory users store => switch to postgresql later

const users = [];

const findUserByEmail = (email) => users.find((u) => u.email === email);
const findUserById = (id) => users.find((u) => u.id === id);
const createUser = (user) => {
    users.push(user);
    return user;
};

const getAllUsers = () => users.map(({ password, ...user }) => user);

export {
    findUserByEmail,
    findUserById,
    createUser,
    getAllUsers,
}