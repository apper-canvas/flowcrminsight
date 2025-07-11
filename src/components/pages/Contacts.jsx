import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { toast } from "react-toastify";
import FilterBuilder from "@/components/molecules/FilterBuilder";
import { filterService } from "@/services/api/filterService";
import ApperIcon from "@/components/ApperIcon";
import EmailComposer from "@/components/organisms/EmailComposer";
import Badge from "@/components/atoms/Badge";
import Select from "@/components/atoms/Select";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
import FilterTabs from "@/components/molecules/FilterTabs";
import Modal from "@/components/molecules/Modal";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Loading from "@/components/ui/Loading";
import { contactService } from "@/services/api/contactService";

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [savedFilters, setSavedFilters] = useState([]);
  const [appliedFilter, setAppliedFilter] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    status: 'prospect',
    tags: []
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

const loadContacts = async () => {
    try {
      setLoading(true);
      setError(null);
      const [contactsData, filtersData] = await Promise.all([
        contactService.getAll(),
        filterService.getByEntityType('contacts')
      ]);
      
      // Transform database field names to UI field names
      const transformedContacts = contactsData.map(contact => ({
        ...contact,
        name: contact.Name || contact.name,
        tags: contact.Tags ? (typeof contact.Tags === 'string' ? contact.Tags.split(',') : contact.Tags) : []
      }));
      
      setContacts(transformedContacts);
      setFilteredContacts(transformedContacts);
      setSavedFilters(filtersData);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

useEffect(() => {
    let filtered = [...contacts];

    // Apply advanced filter if present
    if (appliedFilter && appliedFilter.criteria) {
      filtered = filterService.applyFilter(filtered, appliedFilter.criteria, 'contacts');
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(contact =>
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.company.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(contact => contact.status === statusFilter);
    }

    // Sort contacts
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'company':
          return a.company.localeCompare(b.company);
        case 'created':
          return new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return 0;
      }
    });

    setFilteredContacts(filtered);
  }, [contacts, searchTerm, statusFilter, sortBy, appliedFilter]);

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email is invalid';
    if (!formData.phone.trim()) errors.phone = 'Phone is required';
    if (!formData.company.trim()) errors.company = 'Company is required';
    return errors;
  };

const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) return;

    try {
      setIsSubmitting(true);
      const newContact = await contactService.create(formData);
      
      // Transform database response to UI format
      const transformedContact = {
        ...newContact,
        name: newContact.Name || newContact.name,
        tags: newContact.Tags ? (typeof newContact.Tags === 'string' ? newContact.Tags.split(',') : newContact.Tags) : []
      };
      
      setContacts(prev => [transformedContact, ...prev]);
      setIsModalOpen(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        status: 'prospect',
        tags: []
      });
      toast.success('Contact created successfully');
    } catch (err) {
      toast.error('Failed to create contact');
    } finally {
      setIsSubmitting(false);
    }
  };

const handleDelete = async (contactId) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) return;

    try {
      await contactService.delete(contactId);
      setContacts(prev => prev.filter(c => c.Id !== contactId));
      toast.success('Contact deleted successfully');
    } catch (err) {
      toast.error('Failed to delete contact');
    }
  };

  const handleAdvancedFilter = (filter) => {
    setAppliedFilter(filter);
    setIsAdvancedFilterOpen(false);
    if (filter) {
      toast.success(`Applied filter: ${filter.name}`);
    }
  };

  const handleSavedFilterChange = async (filterId) => {
    if (!filterId) {
      setAppliedFilter(null);
      return;
    }

    try {
      const filter = await filterService.getById(parseInt(filterId));
      setAppliedFilter(filter);
      toast.success(`Applied filter: ${filter.name}`);
    } catch (err) {
      toast.error('Failed to apply saved filter');
    }
  };

  const statusTabs = [
    { label: 'All', value: 'all', count: contacts.length },
    { label: 'Active', value: 'active', count: contacts.filter(c => c.status === 'active').length },
    { label: 'Prospects', value: 'prospect', count: contacts.filter(c => c.status === 'prospect').length },
    { label: 'Inactive', value: 'inactive', count: contacts.filter(c => c.status === 'inactive').length }
  ];

  const statusColors = {
    active: 'success',
    prospect: 'warning', 
    inactive: 'default'
  };
  if (loading) return <Loading type="table" />;
  if (error) return <Error message={error} onRetry={loadContacts} />;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Contacts</h1>
          <p className="text-slate-600 mt-1">Manage your customer relationships</p>
        </div>
        <Button 
          variant="primary" 
          icon="Plus"
          onClick={() => setIsModalOpen(true)}
        >
Add Contact
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon="Search"
          />
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            options={[
              { value: 'name', label: 'Sort by Name' },
              { value: 'company', label: 'Sort by Company' },
              { value: 'created', label: 'Sort by Created Date' }
            ]}
          />
          <Button
            variant="secondary"
            icon="Filter"
            onClick={() => setIsAdvancedFilterOpen(true)}
          >
            Advanced Filters
          </Button>
          <Select
            value={appliedFilter?.Id || ''}
            onChange={(e) => handleSavedFilterChange(e.target.value)}
            options={[
              { value: '', label: 'All Contacts' },
              ...savedFilters.map(filter => ({
                value: filter.Id.toString(),
                label: filter.name
              }))
            ]}
            placeholder="Saved Filters"
          />
        </div>
        
        <FilterTabs
          tabs={statusTabs}
activeTab={statusFilter}
          onTabChange={setStatusFilter}
        />
      </div>

      {/* Contacts List */}
      {filteredContacts.length === 0 ? (
        <Empty
          title="No contacts found"
          message="Start building your customer relationships by adding your first contact."
          actionLabel="Add Contact"
          onAction={() => setIsModalOpen(true)}
          icon="Users"
        />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Tags
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredContacts.map((contact, index) => (
                  <motion.tr
                    key={contact.Id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
<div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {(contact.name || contact.Name || '').charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <Link
                            to={`/contacts/${contact.Id}`}
                            className="text-sm font-medium text-slate-900 hover:text-primary transition-colors"
                          >
                            {contact.name || contact.Name}
                          </Link>
                          <div className="text-sm text-slate-500">{contact.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">{contact.company}</div>
                      <div className="text-sm text-slate-500">{contact.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={statusColors[contact.status]} className="capitalize">
                        {contact.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
<div className="flex space-x-1">
                        {(contact.tags || []).map((tag, tagIndex) => (
                          <Badge key={tagIndex} variant="default" size="sm">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </td>
<td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {format(new Date(contact.createdAt || contact.CreatedOn), 'MMM dd, yyyy')}
                    </td>
<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link to={`/contacts/${contact.Id}`}>
                          <Button variant="ghost" size="sm" icon="Eye" />
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          icon="Mail"
                          onClick={() => {
                            setSelectedContact(contact);
                            setIsEmailModalOpen(true);
                          }}
                        />
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          icon="Trash2"
                          onClick={() => handleDelete(contact.Id)}
                        />
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Contact Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Contact"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              error={formErrors.name}
              required
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              error={formErrors.email}
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              error={formErrors.phone}
              required
            />
            <Input
              label="Company"
              value={formData.company}
              onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
              error={formErrors.company}
              required
            />
          </div>

          <Select
            label="Status"
            value={formData.status}
            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
            options={[
              { value: 'prospect', label: 'Prospect' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' }
            ]}
          />

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
>
              Create Contact
            </Button>
          </div>
        </form>
      </Modal>

      {/* Email Composer Modal */}
      {selectedContact && (
        <EmailComposer
          isOpen={isEmailModalOpen}
          onClose={() => {
            setIsEmailModalOpen(false);
            setSelectedContact(null);
}}
          contact={selectedContact}
        />
      )}
      {/* Advanced Filter Builder Modal */}
      <FilterBuilder
        isOpen={isAdvancedFilterOpen}
        onClose={() => setIsAdvancedFilterOpen(false)}
        entityType="contacts"
        onApplyFilter={handleAdvancedFilter}
      />
    </div>
  );
};
export default Contacts;