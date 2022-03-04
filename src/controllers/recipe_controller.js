const Recipe = require('../models/Recipe');
const User = require('../models/User');

const controller = {
  save: async (name, ingredients, preparation, userId) => {
    const savedRecipe = await Recipe.create({
      name,
      ingredients,
      preparation,
      userId,
    });

    return savedRecipe;
  },
  findAll: async () => {
    const recipes = await Recipe.find();

    return recipes;
  },
  findById: async (id) => {
    const recipe = await Recipe.findById(id);

    return recipe;
  },
  update: async (id, name, ingredients, preparation) => {
    const recipe = await Recipe.findById(id);
    recipe.name = name;
    recipe.ingredients = ingredients;
    recipe.preparation = preparation;
    await recipe.save();
    return recipe;
  },
  isUserValid: async (id, userId) => {
    const recipe = await Recipe.findById(id);
    const user = await User.findById(userId);
    const isUserValid = recipe.userId.toString() === userId || user.role === 'admin';

    return isUserValid;
  },
  delete: async (id) => {
    await Recipe.deleteOne({
      _id: id,
    });
  },
};

module.exports = controller;