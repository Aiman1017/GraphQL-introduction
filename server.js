const express = require('express');
const expressGraphQL = require('express-graphql');
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLID,
    GraphQLInt,
    GraphQLNonNull,
} = require('graphql')
const app = express();

const authors = [
	{ id: 1, name: 'J. K. Rowling' },
	{ id: 2, name: 'J. R. R. Tolkien' },
	{ id: 3, name: 'Brent Weeks' }
]

const books = [
	{ id: 1, name: 'Harry Potter and the Chamber of Secrets', authorId: 1 },
	{ id: 2, name: 'Harry Potter and the Prisoner of Azkaban', authorId: 1 },
	{ id: 3, name: 'Harry Potter and the Goblet of Fire', authorId: 1 },
	{ id: 4, name: 'The Fellowship of the Ring', authorId: 2 },
	{ id: 5, name: 'The Two Towers', authorId: 2 },
	{ id: 6, name: 'The Return of the King', authorId: 2 },
	{ id: 7, name: 'The Way of Shadows', authorId: 3 },
	{ id: 8, name: 'Beyond the Shadows', authorId: 3 }
]

const BookType = new GraphQLObjectType({
    name: 'Book',
    description: 'Book data',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        name: { type: GraphQLNonNull(GraphQLString) },
        authorID: { type: GraphQLNonNull(GraphQLInt) },
        author: { 
            type: AuthorType,
            resolve: (book) => authors.find(author => author.id === book.authorId)
        }
    })
})

const AuthorType = new GraphQLObjectType({
    name: 'AuthorType',
    description: 'Author of the book',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        name: { type: GraphQLNonNull(GraphQLString) },
        books: {
            type: new GraphQLList(BookType),
            // filter Books author ID to match the author ID
            resolve: (author) => books.filter(booksList => booksList.authorId === author.id)
        }
    })
})

// get all the schema available
const Root = new GraphQLObjectType({
    name: 'Query',
    description: 'Root query',
    fields: () => ({
        book: {
            type: BookType,
            description: 'Dedicated book',
            args:{
                id: { type: GraphQLInt}
            },
            resolve: (parent, args) => books.find(book => book.id === args.id)
        },
        books: {
            type: GraphQLList(BookType),
            description: 'Lists of books',
            resolve: () => books
        },
        authors: {
            type: GraphQLList(AuthorType),
            description: 'Lists of Authors of the books',
            resolve: () => authors
        },
        author: {
            type: AuthorType,
            description: 'A single Author',
            args:{
                id: { type: GraphQLNonNull(GraphQLInt) }
            },
            resolve: (parent, args) => authors.find(author => author.id === args.id)
        }
    })
})

const RootMutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: () => ({
        addBook:{
            type: BookType,
            args: {
                authorId: { type: GraphQLNonNull(GraphQLInt) },
                name: { type: GraphQLNonNull(GraphQLString) }
            },
            resolve: (parent, args) => {
                const book = { id: books.length + 1, name: args.name, authorID: args.authorId }
                books.push(book)
                return book
            }
        },
        removeBook: {
            type: BookType,
            args:{
                id: { type: GraphQLNonNull(GraphQLInt) }
            },
            resolve: (parent, args) => {
                const removedBook = { id: args.id }
                books.pop(removedBook)
                return removedBook
            }
        }
    })
})

// Root Schema
const schema = new GraphQLSchema({
    query: Root,
    mutation: RootMutation
})

app.use('/graphql', expressGraphQL.graphqlHTTP({
    graphiql: true,
    schema: schema
}))

app.listen(4000, () => console.log('Server is starting in port 4000'))