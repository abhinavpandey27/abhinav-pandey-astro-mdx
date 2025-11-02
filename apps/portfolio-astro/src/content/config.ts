import { defineCollection, reference } from 'astro:content';
import {
  createAboutFrontmatterSchema,
  createProjectFrontmatterSchema,
  createSiteSettingsFrontmatterSchema
} from './schemas';

const projectsCollection = defineCollection({
  type: 'content',
  schema: ({ image }) => createProjectFrontmatterSchema(image())
});

const siteSettingsCollection = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    createSiteSettingsFrontmatterSchema(image(), reference('projects'))
});

const aboutCollection = defineCollection({
  type: 'content',
  schema: ({ image }) => createAboutFrontmatterSchema(image())
});

export const collections = {
  projects: projectsCollection,
  site: siteSettingsCollection,
  about: aboutCollection
};
