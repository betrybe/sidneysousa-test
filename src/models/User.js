const {
  Schema,
  model,
} = require('mongoose');

const schema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: 'user',
  },
}, {
  versionKey: false,
});

schema.set('toJSON', {
  transform: (doc, ret, _) => {
    const {
      password,
      ...rest
    } = ret;
    const retJson = rest;
    return retJson;
  },
});

const User = model('User', schema);
module.exports = User;