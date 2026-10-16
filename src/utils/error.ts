import {AxiosError} from "axios";

export const getErrorMessage = (error: AxiosError, key: string, t: any): string => {
    switch (error.code) {
        case "ERR_NETWORK": {
            return t(`error.noConnection`);
        }
        default: {
            const data: any = error.response?.data;
            // If there is no data but there is an error message, return it.
            if (!data && error.message) {
                return t(`Error.${key}: ${error.message}`);
            }
            switch (data?.exception) {
                case "com.smateso.proof.adapter.exceptions.AlreadyExistsException": {
                    return t(`error.${key}.alreadyExists`);
                }
                case "com.smateso.proof.adapter.exceptions.NotFoundException": {
                    return t(`error.${key}.notFound`);
                }
                case "com.smateso.proof.adapter.exceptions.InUseException" : {
                    return t(`error.${key}.inUse`);
                }
                default: {
                    return data?.message ?? t(`error.${key}.unknown`);
                }
            }
        }
    }
};