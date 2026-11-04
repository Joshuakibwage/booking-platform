
import axios from "axios";

export function getApiErrorMessage(
    error: unknown,
    fallback: string,
): string {
    if (axios.isAxiosError(error)) {
        const responseData: unknown = error.response?.data;

        if (
            typeof responseData === "object" &&
            responseData !== null &&
            "message" in responseData &&
            typeof responseData.message === "string"
        ) {
            return responseData.message;
        }
    }

    return fallback;
}
