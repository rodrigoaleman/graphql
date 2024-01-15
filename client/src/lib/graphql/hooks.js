import {useMutation, useQuery} from "@apollo/client";
import {companyByIdQuery, createJobMutation, jobByIdQuery, jobsQuery} from "./queries";

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

export function useCreateJob() {
    const [mutate, {loading}] = useMutation(createJobMutation);

    const createJob = async (title, description) => {
        const {data: {job}} = await mutate({
            variables: {
                input: {
                    title,
                    description
                }
            },
            update: (cache, {data}) => {
                cache.writeQuery({
                    query: jobByIdQuery,
                    variables: {id: data.job.id},
                    data
                })
            }
        });
        return job;
    }

    return {
        createJob,
        loading
    };
}