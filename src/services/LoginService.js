import axios from 'axios';
import { Configs } from '@/utils/Configs'

const LOGIN_URL = Configs.API_BASE_URL + '/auth/login';

export  const SetupService = {
    /**
     * Logs in a user with the provided username and password.
     * @param {string} username - The username of the user.
     * @param {string} password - The password of the user.
     * @returns {Promise<Object>} The response data from the login request.
     */
    async login(username, password) {
        return axios.post(LOGIN_URL, { username, password }).then((res) => res.data);
    }
}
