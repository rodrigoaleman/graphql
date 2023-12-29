import {getAccessToken} from "../auth";
import {ApolloClient, InMemoryCache, gql, createHttpLink, ApolloLink, concat} from "@apollo/client";

const httpLink = createHttpLink({uri: 'http://localhost:9000/graphql'});

const authLink = new ApolloLink((operation, forward) => {
    console.log('[customLink] operation: ', operation);
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

const apolloClient = new ApolloClient({
    link: concat(authLink, httpLink),
    cache: new InMemoryCache(),
});

const jobByIdQuery = gql`
    query JobById ($id : ID!) {
        job(id: $id) {
            id
            date
            title
            description
            company {
                id
                name
            }
        }
    }
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
                id
                date
                title
                description
                company {
                    id
                    name
                }
            }
        }
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

export async function getCompany(id) {
    const query = gql`
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

    const {data} = await apolloClient.query({query, variables: {id}});
    return data.company;
}