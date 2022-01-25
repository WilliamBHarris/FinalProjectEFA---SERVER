// const { DataTypes } = require("sequelize");
const ProductModel = require("./product");
const UserModel = require("./user");
const ReviewModel = require('./reviews')

UserModel.hasMany(ReviewModel);
UserModel.hasMany(ProductModel);
ProductModel.hasMany(ReviewModel)

ReviewModel.belongsTo(UserModel);
ProductModel.belongsTo(UserModel);



module.exports = { ProductModel, UserModel, ReviewModel };
