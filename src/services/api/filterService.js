const tableName = 'saved_filter';

export const filterService = {
  async getAll() {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "description" } },
          { field: { Name: "entityType" } },
          { field: { Name: "criteria" } },
          { field: { Name: "createdAt" } },
          { field: { Name: "updatedAt" } },
          { field: { Name: "Tags" } },
          { field: { Name: "CreatedOn" } },
          { field: { Name: "CreatedBy" } },
          { field: { Name: "ModifiedOn" } },
          { field: { Name: "ModifiedBy" } }
        ]
      };

      const response = await apperClient.fetchRecords(tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching filters:", error?.response?.data?.message);
        throw new Error(error.response.data.message);
      } else {
        console.error(error.message);
        throw error;
      }
    }
  },

  async getById(id) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "description" } },
          { field: { Name: "entityType" } },
          { field: { Name: "criteria" } },
          { field: { Name: "createdAt" } },
          { field: { Name: "updatedAt" } },
          { field: { Name: "Tags" } }
        ]
      };

      const response = await apperClient.getRecordById(tableName, id, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching filter with ID ${id}:`, error?.response?.data?.message);
        throw new Error(error.response.data.message);
      } else {
        console.error(error.message);
        throw error;
      }
    }
  },

  async getByEntityType(entityType) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "description" } },
          { field: { Name: "entityType" } },
          { field: { Name: "criteria" } },
          { field: { Name: "createdAt" } },
          { field: { Name: "updatedAt" } }
        ],
        where: [{
          FieldName: "entityType",
          Operator: "EqualTo",
          Values: [entityType]
        }]
      };

      const response = await apperClient.fetchRecords(tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching filters by entity type:", error?.response?.data?.message);
        throw new Error(error.response.data.message);
      } else {
        console.error(error.message);
        throw error;
      }
    }
  },

  async create(filterData) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      // Only include Updateable fields
      const filteredData = {
        Name: filterData.name || filterData.Name,
        description: filterData.description,
        entityType: filterData.entityType,
        criteria: typeof filterData.criteria === 'object' ? JSON.stringify(filterData.criteria) : filterData.criteria,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        Tags: Array.isArray(filterData.tags) ? filterData.tags.join(',') : filterData.tags || ''
      };

      const params = {
        records: [filteredData]
      };

      const response = await apperClient.createRecord(tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              throw new Error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) throw new Error(record.message);
          });
        }
        
        return successfulRecords[0]?.data;
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating filter:", error?.response?.data?.message);
        throw new Error(error.response.data.message);
      } else {
        console.error(error.message);
        throw error;
      }
    }
  },

  async update(id, filterData) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      // Only include Updateable fields
      const filteredUpdateData = {
        Id: parseInt(id),
        updatedAt: new Date().toISOString()
      };

      // Only include fields that are provided
      if (filterData.name !== undefined || filterData.Name !== undefined) {
        filteredUpdateData.Name = filterData.name || filterData.Name;
      }
      if (filterData.description !== undefined) filteredUpdateData.description = filterData.description;
      if (filterData.entityType !== undefined) filteredUpdateData.entityType = filterData.entityType;
      if (filterData.criteria !== undefined) {
        filteredUpdateData.criteria = typeof filterData.criteria === 'object' ? JSON.stringify(filterData.criteria) : filterData.criteria;
      }
      if (filterData.tags !== undefined) {
        filteredUpdateData.Tags = Array.isArray(filterData.tags) ? filterData.tags.join(',') : filterData.tags;
      }

      const params = {
        records: [filteredUpdateData]
      };

      const response = await apperClient.updateRecord(tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              throw new Error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) throw new Error(record.message);
          });
        }
        
        return successfulUpdates[0]?.data;
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating filter:", error?.response?.data?.message);
        throw new Error(error.response.data.message);
      } else {
        console.error(error.message);
        throw error;
      }
    }
  },

  async delete(id) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await apperClient.deleteRecord(tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          failedDeletions.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }
        
        return true;
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting filter:", error?.response?.data?.message);
        throw new Error(error.response.data.message);
      } else {
        console.error(error.message);
        throw error;
      }
    }
  },

  // Apply filter criteria to data - kept for backward compatibility with UI components
  applyFilter(data, criteria, entityType) {
    if (!criteria || criteria.length === 0) return data;

    return data.filter(item => {
      return criteria.every(criterion => {
        const { field, operator, value, value2 } = criterion;
        let itemValue = this.getNestedValue(item, field);

        // Handle null/undefined values
        if (itemValue === null || itemValue === undefined) {
          return false;
        }

        // Convert to string for text operations
        if (typeof itemValue !== 'string' && ['contains', 'equals', 'starts_with', 'ends_with', 'not_contains'].includes(operator)) {
          itemValue = String(itemValue);
        }

        switch (operator) {
          case 'contains':
            return itemValue.toLowerCase().includes(value.toLowerCase());
          case 'equals':
            return itemValue === value || String(itemValue) === String(value);
          case 'starts_with':
            return itemValue.toLowerCase().startsWith(value.toLowerCase());
          case 'ends_with':
            return itemValue.toLowerCase().endsWith(value.toLowerCase());
          case 'not_contains':
            return !itemValue.toLowerCase().includes(value.toLowerCase());
          case 'not_equals':
            return itemValue !== value && String(itemValue) !== String(value);
          case 'greater_than':
            return parseFloat(itemValue) > parseFloat(value);
          case 'less_than':
            return parseFloat(itemValue) < parseFloat(value);
          case 'greater_equal':
            return parseFloat(itemValue) >= parseFloat(value);
          case 'less_equal':
            return parseFloat(itemValue) <= parseFloat(value);
          case 'before':
            return new Date(itemValue) < new Date(value);
          case 'after':
            return new Date(itemValue) > new Date(value);
          case 'between':
            if (field.includes('Date') || field === 'createdAt' || field === 'expectedClose') {
              const itemDate = new Date(itemValue);
              const startDate = new Date(value);
              const endDate = new Date(value2);
              return itemDate >= startDate && itemDate <= endDate;
            } else {
              const numValue = parseFloat(itemValue);
              const startValue = parseFloat(value);
              const endValue = parseFloat(value2);
              return numValue >= startValue && numValue <= endValue;
            }
          default:
            return true;
        }
      });
    });
  },

  // Helper function to get nested values (e.g., 'contact.name')
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
};