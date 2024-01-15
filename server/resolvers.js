import {createJob, deleteJob, getJob, getJobs, getJobsByCompany, updateJob} from "./db/jobs.js";
import {getCompany} from "./db/companies.js";
import {GraphQLError} from "graphql";
import {getUser, getUserByEmail} from "./db/users.js";

export const resolvers = {
    Query: {
        company: async (_root, {id}) => {
            const company = await getCompany(id);
            if (!company) {
                throw new notFoundError('No company found with id' + id);
            }
            return company
        },
        job: async (_root, {id}) => {
            const job = await getJob(id);
            if (!job) throw new notFoundError('No job found with id' + id)
            return job
        },
        jobs: (_root, {limit, offset}) => getJobs(limit, offset)
    },

    Mutation: {
        createJob: (_root, {input: {title, description}}, {user}) => {
            if (!user) throw unauthorizedError('Missing authentication');
            return createJob({companyId: user.companyId, title, description});
        },
        deleteJob: async (_root, {id}, {user}) => {
            if (!user) throw unauthorizedError('Missing authentication');
            const job = await deleteJob(id, user.companyId);
            if (!job) throw notFoundError('No job found with the job ' + id);
            return job;
        },
        updateJob: async (_root, {input: {id, title, description}}, {user}) => {
            if (!user) throw unauthorizedError('Missing authentication');
            const job = await updateJob({id, title, description, companyId: user.companyId});
            if (!job) throw notFoundError('No job found with id ' + id);
            return job;
        },
    },

    Company: {
        jobs: (company) => getJobsByCompany(company.id)
    },

    Job: {
        date: (job) => toIsoDate(job.createdAt),
        company: (job, _args, {companyLoader}) => companyLoader.load(job.companyId)
    }
};

function notFoundError(message) {
    throw new GraphQLError(message, {
        extensions: {code: 'NOT_FOUND'}
    })
}

function unauthorizedError(message) {
    throw new GraphQLError(message, {
        extensions: {code: 'UNAUTHORIZED'}
    })
}

function toIsoDate(value) {
    return value.slice(0, 'yyyy-mm-dd'.length);
}