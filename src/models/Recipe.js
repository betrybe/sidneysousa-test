const {
  Schema,
  model,
} = require('mongoose');

const schema = new Schema({
  name: {
    type: String,
    required: true,
  },
  ingredients: {
    type: String,
    required: true,
  },
  preparation: {
    type: String,
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
});

const Recipe = model('Recipe', schema);
module.exports = Recipe;