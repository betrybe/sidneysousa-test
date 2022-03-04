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
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  image: {
    type: String,
    required: false,
  },
}, {
  versionKey: false,
});

const Recipe = model('Recipe', schema);
module.exports = Recipe;