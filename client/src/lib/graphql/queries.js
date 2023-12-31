import {getAccessToken} from "../auth";
import {ApolloClient, InMemoryCache, gql, createHttpLink, ApolloLink, concat} from "@apollo/client";

const httpLink = createHttpLink({uri: 'http://localhost:9000/graphql'});

const authLink = new ApolloLink((operation, forward) => {
    const accessToken = getAccessToken();
    if (accessToken) {
        operation.setContext({
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
    }
    return forward(operation);
})

export const apolloClient = new ApolloClient({
    link: concat(authLink, httpLink),
    cache: new InMemoryCache(),
});

const jobDetailFragment = gql`
    fragment JobDetail on Job {
        id
        title
        description
        date
        company {
            id
            name
            description
        }
    }
`;

export const companyByIdQuery = gql`
    query CompanyById ($id : ID!) {
        company(id: $id) {
            id
            name
            description
            jobs {
                id
                date
                title
            }
        }
    }
`;

const jobByIdQuery = gql`
    query JobById ($id : ID!) {
        job(id: $id) {
            ...JobDetail
        }
    }
    ${jobDetailFragment}
`;

export async function getJobs() {
    const query = gql`
        query Jobs {
            jobs {
                id
                date
                title
                company {
                    id
                    name
                }
            }
        }
    `;
    const {data} = await apolloClient.query({
        query,
        fetchPolicy: 'network-only'
    });
    return data.jobs;
}

export async function getJob(id) {
    const {data} = await apolloClient.query({query: jobByIdQuery, variables: {id}});
    return data.job;
}


export async function createJob({title, description}) {
    const mutation = gql`
        mutation createJob($input: CreateJobInput!) {
            job: createJob(input: $input ) {
               ...JobDetail
            }
        }
        ${jobDetailFragment}
    `;
    const {data} = await apolloClient.mutate({
        mutation,
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
        },
    });
    return data.job;
}