import {useQuery} from "@apollo/client";
import {companyByIdQuery, jobByIdQuery, jobsQuery} from "./queries";

export function useCompany(id) {
    const {data, loading, error} = useQuery(companyByIdQuery, {
        variables: {id}
    });
    return {company: data?.company, error: Boolean(error), loading}
}

export function useJob(id) {
    const {data, loading, error} = useQuery(jobByIdQuery, {
        variables: {id}
    });
    return {job: data?.job, error: Boolean(error), loading}
}

export function useJobs() {
    const {data, loading, error} = useQuery(jobsQuery, {
        fetchPolicy: 'network-only'
    });

    return {jobs: data?.jobs, error: Boolean(error), loading}
}