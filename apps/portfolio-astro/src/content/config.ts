import { defineCollection, reference } from 'astro:content';
import {
  createAboutFrontmatterSchema,
  createProjectFrontmatterSchema,
  createSiteSettingsFrontmatterSchema
} from './schemas';

const projectsCollection = defineCollection({
  type: 'content',
  schema: () => createProjectFrontmatterSchema()
});

const siteSettingsCollection = defineCollection({
  type: 'content',
  schema: () => createSiteSettingsFrontmatterSchema(reference('projects'))
});

const aboutCollection = defineCollection({
  type: 'content',
  schema: () => createAboutFrontmatterSchema()
});

export const collections = {
  projects: projectsCollection,
  site: siteSettingsCollection,
  about: aboutCollection
};
