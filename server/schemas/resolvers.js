import { AuthenticationError } from "apollo-server-express";
import { User } from "../models";
import { signToken } from "../utils/auth";

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
          if (context.user) {
            const userData = await User.findOne({ _id: context.user._id }).select('-__v -password');
    
            return userData;
          }
    
          throw new AuthenticationError('Not logged in');
        },
    },

    Mutation: {
        addUser: async (parent, args) => {
          const user = await User.create(args);
          const token = signToken(user);
    
          return { token, user };
        },

        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });
            if (!user) {
              throw new AuthenticationError("Incorrect credentials");
            }
            const correctPassword = await user.isCorrectPassword(password);
      
            if (!correctPassword) {
              throw new AuthenticationError("Incorrect credentials");
            }
      
            const token = signToken(user);
            return { token, user };
          },

          saveBook: async (parent, { bookInfo }, context) => {
            if (context.user) {
              const updatedUser = await User.findOneAndUpdate(
                { _id: context.user._id },
                { $push: { savedBooks: bookInfo } },
                { new: true }
              );

              return updatedUser;

            }
            throw new AuthenticationError("You need to be logged in!");
          },

        
          removeBook: async (parent, { bookId }, context) => {
            if (context.user) {
              const updatedUser = await User.findOneAndUpdate(
                { _id: context.user._id },
                { $pull: { savedBooks: { bookId } } },
                { new: true }
              );
              
              return updatedUser;

            }

            throw new AuthenticationError('You need to be logged in!');
          },
      
    },
};

export default resolvers;