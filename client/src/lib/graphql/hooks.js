import {useQuery} from "@apollo/client";
import {companyByIdQuery} from "./queries";

export function useCompany(id) {
    const {data, loading, error} = useQuery(companyByIdQuery, {
        variables: { id }
    });
    return {company: data?.company, error: Boolean(error), loading }
}