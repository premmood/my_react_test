/**
 * ManageTags.js
 * 
 * This React component is responsible for managing tags within the application.
 * 
 * Functions and Features:
 * 
 * 1. fetchTags: Fetches all the tags from the backend.
 * 2. createTag: Creates a new tag.
 * 3. updateTag: Updates an existing tag.
 * 4. deleteTag: Deletes a tag.
 * 
 * State Variables:
 * 
 * 1. tags: Holds the list of tags.
 * 2. newTag: Holds the name of the new tag to be created.
 * 
 * External Libraries and Components:
 * 
 * 1. apiWrapper: A wrapper for API calls to the backend server.
 * 
 * Note: 
 * 
 * The component uses console.error for error logging purposes. 
 * These can be removed or commented out in a production environment.
 */


import React, { useState, useEffect } from 'react';
import apiWrapper from './apiWrapper';

const ManageTags = () => {
  const [tags, setTags] = useState([]);
  // const [newTag, setNewTag] = useState('');
  // const colors = ['red', 'orange', 'yellow', 'olive', 'green', 'teal', 'blue', 'violet', 'purple', 'pink', 'brown', 'grey', 'black'];
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await apiWrapper.getAllTags();
        const data = response.data;
        if (Array.isArray(data)) {
          setTags(data);
        }
      } catch (error) {
        console.error('An error occurred while fetching tags:', error);
      }
    };

    fetchTags();
  }, []);

/*   const createTag = async () => {
    try {
      const response = await apiWrapper.createTag({ name: newTag });
      const newTag = response.data;
      setTags(prevTags => [newTag, ...prevTags]);
      // setNewTag('');
    } catch (error) {
      console.error('An error occurred while creating the new tag:', error);
    }
  }; */

/*   const updateTag = async (tagId, newName) => {
    try {
      await apiWrapper.updateTag(tagId, { name: newName });
      setTags(prevTags => prevTags.map(tag => {
        if (tag.id === tagId) {
          return { ...tag, name: newName };
        }
        return tag;
      }));
    } catch (error) {
      console.error('An error occurred while updating the tag:', error);
    }
  }; */

/*   const deleteTag = async (tagId) => {
    try {
      await apiWrapper.deleteTag(tagId);
      setTags(prevTags => prevTags.filter(tag => tag.id !== tagId));
    } catch (error) {
      console.error('An error occurred while deleting the tag:', error);
    }
  }; */


  return (
    <div className="ui center aligned basic segment">
      <div className="ui text container">
        <h1>Manage Your Organisation's Tags</h1>
        <p>Create your own tags to help you keep track of basic details for your clients and suppliers.</p>
      </div>
      <div className="ui divider"></div>
      <div className="ui big tag labels">
        {tags.map((tag, index) => (
          <div key={tag.id} className={`ui black label`}>
            {tag.fullTagName}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageTags;