import {UserInfo} from "./types-for-test";

class UserService {
    public getUserInfo(): UserInfo {
        return {id: 1, name: 'Jack'};
    }
}

export default () => new UserService();