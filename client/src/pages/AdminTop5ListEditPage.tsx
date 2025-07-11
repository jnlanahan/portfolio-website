import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Edit, 
  Trash2, 
  List,
  AlertCircle
} from "lucide-react";

const listSchema = z.object({
  title: z.string().min(1, "Title is required"),
  icon: z.string().min(1, "Icon is required"),
  color: z.string().optional(),
  description: z.string().optional(),
  mainImage: z.string().optional(),
  position: z.number().min(0).optional(),
});

const itemSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  link: z.string().optional(),
  linkText: z.string().optional(),
  image: z.string().optional(),
  highlight: z.boolean().optional(),
  position: z.number().min(0).optional(),
});

export default function AdminTop5ListEditPage() {
  const [, setLocation] = useLocation();
  const { id } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddItem, setShowAddItem] = useState(false);

  const isEditing = id !== "new";

  // Fetch list data if editing
  const { data: list, isLoading } = useQuery({
    queryKey: ["/api/admin/top5-lists", id],
    enabled: isEditing,
  });

  // Fetch list items
  const { data: items } = useQuery({
    queryKey: ["/api/admin/top5-lists", id, "items"],
    enabled: isEditing,
  });

  // Form for list
  const {
    register: registerList,
    handleSubmit: handleSubmitList,
    formState: { errors: listErrors },
    reset: resetList,
  } = useForm({
    resolver: zodResolver(listSchema),
    defaultValues: {
      title: "",
      icon: "ri-list-line",
      color: "#22c55e",
      description: "",
      mainImage: "",
      position: 0,
    },
  });

  // Form for new item
  const {
    register: registerItem,
    handleSubmit: handleSubmitItem,
    formState: { errors: itemErrors },
    reset: resetItem,
  } = useForm({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      title: "",
      description: "",
      link: "",
      linkText: "",
      image: "",
      highlight: false,
      position: 0,
    },
  });

  // Reset form when data loads
  useEffect(() => {
    if (list) {
      resetList({
        title: list.title,
        icon: list.icon,
        color: list.color || "#22c55e",
        description: list.description || "",
        mainImage: list.mainImage || "",
        position: list.position || 0,
      });
    }
  }, [list, resetList]);

  // Save/Update list mutation
  const saveListMutation = useMutation({
    mutationFn: async (data: any) => {
      if (isEditing) {
        return await apiRequest(`/api/admin/top5-lists/${id}`, "PUT", data);
      } else {
        return await apiRequest("/api/admin/top5-lists", "POST", data);
      }
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/top5-lists"] });
      toast({
        title: isEditing ? "List updated successfully" : "List created successfully",
        description: isEditing ? "Your changes have been saved" : "New list has been created",
      });
      if (!isEditing) {
        setLocation(`/admin/top5-lists/${response.id}`);
      }
    },
    onError: () => {
      toast({
        title: "Save failed",
        description: "An error occurred while saving the list",
        variant: "destructive",
      });
    },
  });

  // Add item mutation
  const addItemMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest(`/api/admin/top5-lists/${id}/items`, "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/top5-lists", id, "items"] });
      toast({
        title: "Item added successfully",
        description: "New item has been added to the list",
      });
      resetItem();
      setShowAddItem(false);
    },
    onError: () => {
      toast({
        title: "Add failed",
        description: "An error occurred while adding the item",
        variant: "destructive",
      });
    },
  });

  // Delete item mutation
  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: number) => {
      return await apiRequest(`/api/admin/top5-list-items/${itemId}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/top5-lists", id, "items"] });
      toast({
        title: "Item deleted successfully",
        description: "The item has been removed from the list",
      });
    },
    onError: () => {
      toast({
        title: "Delete failed",
        description: "An error occurred while deleting the item",
        variant: "destructive",
      });
    },
  });

  const onSubmitList = (data: any) => {
    saveListMutation.mutate(data);
  };

  const onSubmitItem = (data: any) => {
    addItemMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading list...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => setLocation("/admin/top5-lists")}
                className="flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                Back to Lists
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isEditing ? "Edit List" : "Create New List"}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isEditing ? "Modify your Top 5 list" : "Create a new Top 5 list"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* List Details */}
          <Card>
            <CardHeader>
              <CardTitle>List Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitList(onSubmitList)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    {...registerList("title")}
                    placeholder="e.g., Top 5 Dev Tools"
                    className={listErrors.title ? "border-red-500" : ""}
                  />
                  {listErrors.title && (
                    <p className="text-sm text-red-500">{listErrors.title.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="icon">Icon *</Label>
                  <Input
                    id="icon"
                    {...registerList("icon")}
                    placeholder="e.g., ri-code-line"
                    className={listErrors.icon ? "border-red-500" : ""}
                  />
                  {listErrors.icon && (
                    <p className="text-sm text-red-500">{listErrors.icon.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    {...registerList("color")}
                    placeholder="#22c55e"
                    type="color"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    {...registerList("description")}
                    placeholder="Brief description of this list..."
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mainImage">Main Image URL</Label>
                  <Input
                    id="mainImage"
                    {...registerList("mainImage")}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    {...registerList("position", { valueAsNumber: true })}
                    type="number"
                    min="0"
                    placeholder="0"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={saveListMutation.isPending}
                  className="w-full"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {saveListMutation.isPending 
                    ? "Saving..." 
                    : isEditing 
                      ? "Update List" 
                      : "Create List"
                  }
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Items Management */}
          {isEditing && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>List Items</CardTitle>
                  <Button
                    size="sm"
                    onClick={() => setShowAddItem(!showAddItem)}
                    className="flex items-center gap-2"
                  >
                    <Plus size={16} />
                    Add Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Add Item Form */}
                {showAddItem && (
                  <Card className="mb-4">
                    <CardHeader>
                      <CardTitle className="text-lg">Add New Item</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmitItem(onSubmitItem)} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="itemTitle">Title *</Label>
                          <Input
                            id="itemTitle"
                            {...registerItem("title")}
                            placeholder="Item title"
                            className={itemErrors.title ? "border-red-500" : ""}
                          />
                          {itemErrors.title && (
                            <p className="text-sm text-red-500">{itemErrors.title.message}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="itemDescription">Description *</Label>
                          <Textarea
                            id="itemDescription"
                            {...registerItem("description")}
                            placeholder="Item description"
                            className={itemErrors.description ? "border-red-500" : ""}
                          />
                          {itemErrors.description && (
                            <p className="text-sm text-red-500">{itemErrors.description.message}</p>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="itemLink">Link</Label>
                            <Input
                              id="itemLink"
                              {...registerItem("link")}
                              placeholder="https://example.com"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="itemLinkText">Link Text</Label>
                            <Input
                              id="itemLinkText"
                              {...registerItem("linkText")}
                              placeholder="Visit Site"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="itemImage">Image URL</Label>
                          <Input
                            id="itemImage"
                            {...registerItem("image")}
                            placeholder="https://example.com/image.jpg"
                          />
                        </div>

                        <div className="flex gap-2">
                          <Button
                            type="submit"
                            disabled={addItemMutation.isPending}
                            className="flex items-center gap-2"
                          >
                            <Plus size={16} />
                            {addItemMutation.isPending ? "Adding..." : "Add Item"}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowAddItem(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                )}

                {/* Existing Items */}
                <div className="space-y-3">
                  {items?.map((item: any) => (
                    <Card key={item.id} className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{item.title}</h4>
                          <p className="text-sm text-gray-600">{item.description}</p>
                          {item.link && (
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline"
                            >
                              {item.linkText || "Visit Link"}
                            </a>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {item.highlight && (
                            <Badge variant="secondary">Highlight</Badge>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteItemMutation.mutate(item.id)}
                            disabled={deleteItemMutation.isPending}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                  {items?.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <List className="h-8 w-8 mx-auto mb-2" />
                      <p>No items yet. Add your first item above.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}