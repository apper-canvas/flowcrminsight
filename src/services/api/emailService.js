const tableName = 'email';

export const emailService = {
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
          { field: { Name: "contactId" } },
          { field: { Name: "to" } },
          { field: { Name: "from" } },
          { field: { Name: "subject" } },
          { field: { Name: "content" } },
          { field: { Name: "timestamp" } },
          { field: { Name: "type" } },
          { field: { Name: "threadId" } },
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
        console.error("Error fetching emails:", error?.response?.data?.message);
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
          { field: { Name: "contactId" } },
          { field: { Name: "to" } },
          { field: { Name: "from" } },
          { field: { Name: "subject" } },
          { field: { Name: "content" } },
          { field: { Name: "timestamp" } },
          { field: { Name: "type" } },
          { field: { Name: "threadId" } },
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
        console.error(`Error fetching email with ID ${id}:`, error?.response?.data?.message);
        throw new Error(error.response.data.message);
      } else {
        console.error(error.message);
        throw error;
      }
    }
  },

  async getByContactId(contactId) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "contactId" } },
          { field: { Name: "to" } },
          { field: { Name: "from" } },
          { field: { Name: "subject" } },
          { field: { Name: "content" } },
          { field: { Name: "timestamp" } },
          { field: { Name: "type" } },
          { field: { Name: "threadId" } }
        ],
        where: [{
          FieldName: "contactId",
          Operator: "EqualTo",
          Values: [parseInt(contactId)]
        }],
        orderBy: [{
          fieldName: "timestamp",
          sorttype: "DESC"
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
        console.error("Error fetching emails by contact ID:", error?.response?.data?.message);
        throw new Error(error.response.data.message);
      } else {
        console.error(error.message);
        throw error;
      }
    }
  },

  async getThreadById(threadId) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "contactId" } },
          { field: { Name: "to" } },
          { field: { Name: "from" } },
          { field: { Name: "subject" } },
          { field: { Name: "content" } },
          { field: { Name: "timestamp" } },
          { field: { Name: "type" } },
          { field: { Name: "threadId" } }
        ],
        whereGroups: [{
          operator: "OR",
          subGroups: [
            {
              conditions: [{
                fieldName: "threadId",
                operator: "EqualTo",
                values: [parseInt(threadId)],
                include: true
              }]
            },
            {
              conditions: [{
                fieldName: "Id",
                operator: "EqualTo",
                values: [parseInt(threadId)],
                include: true
              }]
            }
          ]
        }],
        orderBy: [{
          fieldName: "timestamp",
          sorttype: "ASC"
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
        console.error("Error fetching email thread:", error?.response?.data?.message);
        throw new Error(error.response.data.message);
      } else {
        console.error(error.message);
        throw error;
      }
    }
  },

  async send(emailData) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      // Only include Updateable fields
      const filteredData = {
        contactId: parseInt(emailData.contactId),
        to: emailData.to,
        from: emailData.from || 'you@company.com',
        subject: emailData.subject,
        content: emailData.content,
        timestamp: new Date().toISOString(),
        type: 'sent',
        threadId: emailData.threadId ? parseInt(emailData.threadId) : null,
        Tags: Array.isArray(emailData.tags) ? emailData.tags.join(',') : emailData.tags || ''
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
        console.error("Error sending email:", error?.response?.data?.message);
        throw new Error(error.response.data.message);
      } else {
        console.error(error.message);
        throw error;
      }
    }
  },

  async saveDraft(emailData) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      // Only include Updateable fields
      const filteredData = {
        contactId: parseInt(emailData.contactId),
        to: emailData.to,
        from: emailData.from || 'you@company.com',
        subject: emailData.subject,
        content: emailData.content,
        timestamp: new Date().toISOString(),
        type: 'draft',
        threadId: emailData.threadId ? parseInt(emailData.threadId) : null,
        Tags: Array.isArray(emailData.tags) ? emailData.tags.join(',') : emailData.tags || ''
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
        console.error("Error saving email draft:", error?.response?.data?.message);
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
        console.error("Error deleting email:", error?.response?.data?.message);
        throw new Error(error.response.data.message);
      } else {
        console.error(error.message);
        throw error;
      }
    }
  },

  async search(query, contactId = null) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const searchParams = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "contactId" } },
          { field: { Name: "to" } },
          { field: { Name: "from" } },
          { field: { Name: "subject" } },
          { field: { Name: "content" } },
          { field: { Name: "timestamp" } },
          { field: { Name: "type" } },
          { field: { Name: "threadId" } }
        ],
        whereGroups: [{
          operator: "OR",
          subGroups: [
            {
              conditions: [{
                fieldName: "subject",
                operator: "Contains",
                values: [query],
                include: true
              }]
            },
            {
              conditions: [{
                fieldName: "content",
                operator: "Contains",
                values: [query],
                include: true
              }]
            }
          ]
        }],
        orderBy: [{
          fieldName: "timestamp",
          sorttype: "DESC"
        }]
      };

      if (contactId) {
        searchParams.where = [{
          FieldName: "contactId",
          Operator: "EqualTo",
          Values: [parseInt(contactId)]
        }];
      }

      const response = await apperClient.fetchRecords(tableName, searchParams);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error searching emails:", error?.response?.data?.message);
        throw new Error(error.response.data.message);
      } else {
        console.error(error.message);
        throw error;
      }
    }
  }
};