import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Users, Search, ChevronRight, Mail, Activity } from "lucide-react";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import EmptyState from "../../components/ui/EmptyState";
import { trainerService } from "../../services/trainer";
import { formatDate } from "../../utils/helpers";

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const data = await trainerService.getClients();
      setClients(data || []);
    } catch (error) {
      console.error("Failed to fetch clients:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(
    (client) =>
      client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-primary">Clients</h1>
        <p className="text-muted">View and manage your assigned clients</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          size={20}
        />
        <Input
          type="text"
          placeholder="Search clients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Clients List */}
      {filteredClients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => (
            <Link key={client._id} to={`/trainer/clients/${client._id}`}>
              <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center text-white text-xl font-medium shrink-0">
                    {client.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-primary truncate">
                      {client.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted mt-1">
                      <Mail size={14} />
                      <span className="truncate">{client.email}</span>
                    </div>
                    {client.profile && (
                      <div className="flex items-center gap-3 text-sm text-muted mt-2">
                        {client.profile.age && (
                          <span>{client.profile.age} years</span>
                        )}
                        {client.profile.gender && (
                          <span className="capitalize">
                            {client.profile.gender}
                          </span>
                        )}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-muted mt-2">
                      <Activity size={14} />
                      <span>Joined {formatDate(client.createdAt)}</span>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-muted shrink-0" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Users}
          title={searchTerm ? "No clients found" : "No clients assigned"}
          description={
            searchTerm
              ? "Try a different search term"
              : "When users are assigned to you, they will appear here"
          }
        />
      )}
    </div>
  );
};

export default Clients;
