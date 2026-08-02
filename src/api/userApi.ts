import { axiosClient } from "./axiosClient";

export interface SignUpPayload {
    username: string;
    mobile: string;
    countryCode: string;
    password: string;
}

export const userApi = {
    checkUsernameAvailability: (username: string) =>
        axiosClient
            .post<{ data: boolean }>("/user/validate-sign-up", { username })
            .then((res) => res.data.data),

    checkMobileAvailability: (mobile: number, countryCode: number) =>
        axiosClient
            .post<{ data: boolean }>("/user/validate-sign-up", { mobile, countryCode })
            .then((res) => res.data.data),

    signUp: (payload: SignUpPayload) =>
        axiosClient
            .post<{ data: string }>("/user/sign-up", payload)
            .then((res) => res.data.data),
};
