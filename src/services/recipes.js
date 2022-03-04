const {
  Router,
} = require('express');
const {
  ObjectId,
} = require('mongodb').ObjectId;
const multer = require('multer');

const recipeCtrl = require('../controllers/recipe_controller');
const {
  getToken,
  validateToken,
} = require('../utils/token_utils');

const imagesPath = 'src/uploads/';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imagesPath);
  },
  filename: async (req, file, cb) => {
    const {
      id,
    } = req.params;

    const extArray = file.mimetype.split('/');
    const extension = extArray[extArray.length - 1];
    const imageFileName = `${id}.${extension}`;
    cb(null, imageFileName);

    const image = `${req.get('host')}/${imagesPath}${imageFileName}`;
    const recipe = await recipeCtrl.findById(id);
    recipe.image = image;
    await recipe.save();
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'image/jpeg') {
      cb(null, true);
    }

    cb(null, false);
  },
});

const validateRecipeInputs = (name, ingredients, preparation) => name && ingredients && preparation;

const userCanUpdateOrDelete = async (id, token) => {
  const userId = validateToken(token);
  const isUserValid = ObjectId.isValid(userId);
  const canUpdate = isUserValid && await recipeCtrl.isUserValid(id, userId);
  return canUpdate;
};

const validateRecipe = async (name, ingredients, preparation, token) => {
  const areFieldsValid = validateRecipeInputs(name, ingredients, preparation);
  const userId = validateToken(token);
  let statusCode = userId ? 200 : 401;
  statusCode = areFieldsValid ? statusCode : 400;

  return {
    statusCode,
    userId,
  };
};

const getUpdateInputs = (req) => {
  const {
    name,
    ingredients,
    preparation,
  } = req.body;
  const {
    id,
  } = req.params;

  return {
    name,
    ingredients,
    preparation,
    id,
    token: getToken(req),
  };
};

const validateRecipeUpdate = async (id, token) => {
  let message = !token ? 'missing auth token' : 'Ok';
  const canUpdate = await userCanUpdateOrDelete(id, token);
  const isMalformed = token && !canUpdate;
  message = isMalformed ? 'jwt malformed' : message;
  const statusCode = message === 'Ok' ? 200 : 401;

  return {
    statusCode,
    message,
  };
};

const verifyUserCanUpload = async (req, res, next) => {
  const {
    id,
    token,
  } = getUpdateInputs(req);

  const response = await validateRecipeUpdate(id, token);
  if (response.statusCode === 200) {
    return next();
  }

  return res.status(response.statusCode).json({
    message: response.message,
  });
};

const recipesRouter = Router();

recipesRouter.post('/', async (req, res) => {
  const {
    name,
    ingredients,
    preparation,
  } = req.body;

  const token = getToken(req);
  const response = await validateRecipe(name, ingredients, preparation, token);

  if (response.statusCode === 200) {
    const recipe = await recipeCtrl.save(name, ingredients, preparation, response.userId);
    return res.status(201).json({
      recipe,
    });
  }

  const msg1 = 'Invalid entries. Try again.';
  const msg2 = 'jwt malformed';
  return res.status(response.statusCode).json({
    message: response.statusCode === 400 ? msg1 : msg2,
  });
});

recipesRouter.get('/', async (_, res) => {
  const recipes = await recipeCtrl.findAll();

  return res.status(200).json(recipes);
});

recipesRouter.get('/:id', async (req, res) => {
  const {
    id,
  } = req.params;

  const recipe = ObjectId.isValid(id) ? await recipeCtrl.findById(id) : null;

  if (recipe) {
    return res.status(200).json(recipe);
  }

  return res.status(404).json({
    message: 'recipe not found',
  });
});

recipesRouter.put('/:id', async (req, res) => {
  const {
    name,
    ingredients,
    preparation,
    id,
    token,
  } = getUpdateInputs(req);

  const response = await validateRecipeUpdate(id, token);

  if (response.statusCode === 200) {
    const updatedRecipe = await recipeCtrl.update(id, name, ingredients, preparation);
    return res.status(response.statusCode).json(updatedRecipe);
  }

  return res.status(response.statusCode).json({
    message: response.message,
  });
});

recipesRouter.delete('/:id', async (req, res) => {
  const {
    id,
    token,
  } = getUpdateInputs(req);

  const response = await validateRecipeUpdate(id, token);
  if (response.statusCode === 200) {
    await recipeCtrl.delete(id);
    return res.status(204).send();
  }

  return res.status(response.statusCode).json({
    message: response.message,
  });
});

recipesRouter.put('/:id/image', verifyUserCanUpload, upload.single('image'), async (req, res) => {
  const {
    id,
  } = req.params;

  const recipe = await recipeCtrl.findById(id);
  res.status(200).json(recipe);
});

module.exports = recipesRouter;