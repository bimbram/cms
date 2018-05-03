const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const URLSlugs = require('mongoose-url-slugs');


const PostSchema = new Schema({
  title: {
    type: String,
    required: true
  },

  status: {
    type: String,
    default: 'public'
  },

  allowComments: {
    type: Boolean,
    required: true
  },

  body: {
    type: String,
    required: true
  },

  file: {
    type: String
  },

  date: {
    type: Date,
    default: Date.now()
  },

  comments: [{
    type: Schema.Types.ObjectId,
    ref: 'comments'
  }],

  category: {
    type: Schema.Types.ObjectId,
    ref: 'categories'
  },

  slug: {
    type: String
  },

  user: {
    type: Schema.Types.ObjectId,
    ref: 'users'
  }

}, {usePushEach: true});

PostSchema.plugin(URLSlugs('title', {field: 'slug'}));

module.exports = mongoose.model('posts', PostSchema)
