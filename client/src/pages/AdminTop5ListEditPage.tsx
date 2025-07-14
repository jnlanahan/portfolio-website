import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, Plus, Trash2, Upload, Edit2 } from "lucide-react";

// Schemas
const listSchema = z.object({
  title: z.string().min(1, "Title is required"),
  icon: z.string().min(1, "Icon is required"),
  color: z.string().min(1, "Color is required"),
  description: z.string().optional(),
  mainImage: z.string().optional(),
  position: z.number().min(0),
});

const itemSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  link: z.string().optional(),
  linkText: z.string().optional(),
  image: z.string().optional(),
  highlight: z.boolean().default(false),
  position: z.number().min(1).max(5),
});

type ListFormData = z.infer<typeof listSchema>;
type ItemFormData = z.infer<typeof itemSchema>;

export default function AdminTop5ListEditPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [showAddItem, setShowAddItem] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [uploadingMainImage, setUploadingMainImage] = useState(false);
  const [uploadingItemImage, setUploadingItemImage] = useState(false);
  
  const isEditing = id !== "new";

  // Auth check
  const { data: authCheck } = useQuery({
    queryKey: ["/api/admin/check-auth"],
    retry: false,
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (authCheck === null) {
      setLocation("/admin/login");
    }
  }, [authCheck, setLocation]);

  // Fetch list data
  const { data: list, isLoading: listLoading } = useQuery({
    queryKey: [`/api/admin/top5-lists/${id}`],
    enabled: isEditing && !!authCheck?.authenticated,
  });

  // Fetch items
  const { data: items = [], isLoading: itemsLoading } = useQuery({
    queryKey: [`/api/admin/top5-lists/${id}/items`],
    enabled: isEditing && !!authCheck?.authenticated,
  });

  // List form
  const listForm = useForm<ListFormData>({
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

  // Item form
  const itemForm = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      title: "",
      description: "",
      link: "",
      linkText: "",
      image: "",
      highlight: false,
      position: 1,
    },
  });

  // Reset list form when data loads
  useEffect(() => {
    if (list) {
      listForm.reset({
        title: list.title || "",
        icon: list.icon || "ri-list-line",
        color: list.color || "#22c55e",
        description: list.description || "",
        mainImage: list.mainImage || "",
        position: list.position || 0,
      });
    }
  }, [list, listForm]);

  // Save list mutation
  const saveListMutation = useMutation({
    mutationFn: async (data: ListFormData) => {
      const url = isEditing ? `/api/admin/top5-lists/${id}` : "/api/admin/top5-lists";
      const method = isEditing ? "PUT" : "POST";
      return await apiRequest(url, method, data);
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/top5-lists"] });
      toast({
        title: isEditing ? "List updated" : "List created",
        description: isEditing ? "Your changes have been saved" : "New list has been created",
      });
      if (!isEditing && response.id) {
        setLocation(`/admin/top5-lists/${response.id}`);
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save list",
        variant: "destructive",
      });
    },
  });

  // Add item mutation
  const addItemMutation = useMutation({
    mutationFn: async (data: ItemFormData) => {
      return await apiRequest(`/api/admin/top5-lists/${id}/items`, "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/top5-lists/${id}/items`] });
      toast({
        title: "Item added",
        description: "New item has been added to the list",
      });
      itemForm.reset();
      setShowAddItem(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add item",
        variant: "destructive",
      });
    },
  });

  // Update item mutation
  const updateItemMutation = useMutation({
    mutationFn: async (data: ItemFormData & { id: number }) => {
      const { id: itemId, ...updateData } = data;
      return await apiRequest(`/api/admin/top5-list-items/${itemId}`, "PUT", updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/top5-lists/${id}/items`] });
      toast({
        title: "Item updated",
        description: "The item has been updated successfully",
      });
      itemForm.reset();
      setEditingItem(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update item",
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
      queryClient.invalidateQueries({ queryKey: [`/api/admin/top5-lists/${id}/items`] });
      toast({
        title: "Item deleted",
        description: "The item has been removed from the list",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive",
      });
    },
  });

  // Image upload handlers
  const handleMainImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingMainImage(true);
    const formData = new FormData();
    formData.append('files', file);

    try {
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }
      
      const uploadedUrl = result.files[0];
      if (uploadedUrl) {
        listForm.setValue('mainImage', uploadedUrl);
        toast({
          title: "Image uploaded",
          description: "Main image has been updated",
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An error occurred while uploading the image",
        variant: "destructive",
      });
    } finally {
      setUploadingMainImage(false);
      event.target.value = '';
    }
  };

  const handleItemImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingItemImage(true);
    const formData = new FormData();
    formData.append('files', file);

    try {
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }
      
      const uploadedUrl = result.files[0];
      if (uploadedUrl) {
        itemForm.setValue('image', uploadedUrl);
        toast({
          title: "Image uploaded",
          description: "Item image has been updated",
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An error occurred while uploading the image",
        variant: "destructive",
      });
    } finally {
      setUploadingItemImage(false);
      event.target.value = '';
    }
  };

  // Edit item handler
  const startEditItem = (item: any) => {
    setEditingItem(item);
    setShowAddItem(false);
    itemForm.reset({
      title: item.title || "",
      description: item.description || "",
      link: item.link || "",
      linkText: item.linkText || "",
      image: item.image || "",
      highlight: item.highlight || false,
      position: item.position || 1,
    });
  };

  const cancelEdit = () => {
    setEditingItem(null);
    itemForm.reset();
  };

  // Form submit handlers
  const onSubmitList = (data: ListFormData) => {
    saveListMutation.mutate(data);
  };

  const onSubmitItem = (data: ItemFormData) => {
    if (editingItem) {
      updateItemMutation.mutate({ ...data, id: editingItem.id });
    } else {
      addItemMutation.mutate(data);
    }
  };

  if (listLoading || itemsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - List Details */}
          <Card>
            <CardHeader>
              <CardTitle>List Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={listForm.handleSubmit(onSubmitList)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    {...listForm.register("title")}
                    placeholder="e.g., Top 5 Dev Tools"
                    className={listForm.formState.errors.title ? "border-red-500" : ""}
                  />
                  {listForm.formState.errors.title && (
                    <p className="text-sm text-red-500">{listForm.formState.errors.title.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="icon">Icon *</Label>
                  <Select
                    value={listForm.watch("icon")}
                    onValueChange={(value) => listForm.setValue("icon", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an icon" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ri-list-line">
                        <div className="flex items-center gap-2">
                          <i className="ri-list-line"></i>
                          List
                        </div>
                      </SelectItem>
                      <SelectItem value="ri-code-line">
                        <div className="flex items-center gap-2">
                          <i className="ri-code-line"></i>
                          Code
                        </div>
                      </SelectItem>
                      <SelectItem value="ri-book-line">
                        <div className="flex items-center gap-2">
                          <i className="ri-book-line"></i>
                          Book
                        </div>
                      </SelectItem>
                      <SelectItem value="ri-star-line">
                        <div className="flex items-center gap-2">
                          <i className="ri-star-line"></i>
                          Star
                        </div>
                      </SelectItem>
                      <SelectItem value="ri-heart-line">
                        <div className="flex items-center gap-2">
                          <i className="ri-heart-line"></i>
                          Heart
                        </div>
                      </SelectItem>
                      <SelectItem value="ri-trophy-line">
                        <div className="flex items-center gap-2">
                          <i className="ri-trophy-line"></i>
                          Trophy
                        </div>
                      </SelectItem>
                      <SelectItem value="ri-lightbulb-line">
                        <div className="flex items-center gap-2">
                          <i className="ri-lightbulb-line"></i>
                          Lightbulb
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    {...listForm.register("color")}
                    type="color"
                    className="h-10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    {...listForm.register("description")}
                    placeholder="Brief description of the list"
                    className="min-h-[80px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mainImage">Main Image</Label>
                  <div className="flex gap-2">
                    <Input
                      id="mainImage"
                      {...listForm.register("mainImage")}
                      placeholder="https://example.com/image.jpg"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={uploadingMainImage}
                      onClick={() => document.getElementById('mainImageUpload')?.click()}
                    >
                      <Upload size={16} className="mr-2" />
                      {uploadingMainImage ? "Uploading..." : "Upload"}
                    </Button>
                  </div>
                  <input
                    id="mainImageUpload"
                    type="file"
                    accept="image/*"
                    onChange={handleMainImageUpload}
                    style={{ display: 'none' }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    {...listForm.register("position", { valueAsNumber: true })}
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

          {/* Right Side - Items Management */}
          {isEditing && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Top 5 Items</CardTitle>
                  <Button
                    size="sm"
                    onClick={() => {
                      setShowAddItem(!showAddItem);
                      setEditingItem(null);
                      itemForm.reset();
                    }}
                    className="flex items-center gap-2"
                  >
                    <Plus size={16} />
                    Add Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Add/Edit Item Form */}
                {(showAddItem || editingItem) && (
                  <Card className="mb-4">
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {editingItem ? "Edit Item" : "Add New Item"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={itemForm.handleSubmit(onSubmitItem)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="itemTitle">Title *</Label>
                            <Input
                              id="itemTitle"
                              {...itemForm.register("title")}
                              placeholder="Item title"
                              className={itemForm.formState.errors.title ? "border-red-500" : ""}
                            />
                            {itemForm.formState.errors.title && (
                              <p className="text-sm text-red-500">{itemForm.formState.errors.title.message}</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="itemPosition">Position (1-5)</Label>
                            <Input
                              id="itemPosition"
                              {...itemForm.register("position", { valueAsNumber: true })}
                              type="number"
                              min="1"
                              max="5"
                              placeholder="1"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="itemDescription">Description</Label>
                          <Textarea
                            id="itemDescription"
                            {...itemForm.register("description")}
                            placeholder="Brief description (optional)"
                            className="min-h-[60px]"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="itemLink">Link</Label>
                            <Input
                              id="itemLink"
                              {...itemForm.register("link")}
                              placeholder="https://example.com"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="itemLinkText">Link Text</Label>
                            <Input
                              id="itemLinkText"
                              {...itemForm.register("linkText")}
                              placeholder="Visit Site"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="itemImage">Image</Label>
                          <div className="flex gap-2">
                            <Input
                              id="itemImage"
                              {...itemForm.register("image")}
                              placeholder="https://example.com/image.jpg"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              disabled={uploadingItemImage}
                              onClick={() => document.getElementById('itemImageUpload')?.click()}
                            >
                              <Upload size={16} className="mr-2" />
                              {uploadingItemImage ? "Uploading..." : "Upload"}
                            </Button>
                          </div>
                          <input
                            id="itemImageUpload"
                            type="file"
                            accept="image/*"
                            onChange={handleItemImageUpload}
                            style={{ display: 'none' }}
                          />
                        </div>

                        <div className="flex items-center space-x-2">
                          <input
                            id="itemHighlight"
                            type="checkbox"
                            {...itemForm.register("highlight")}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <Label htmlFor="itemHighlight" className="text-sm font-medium">
                            Highlight this item
                          </Label>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            type="submit"
                            disabled={addItemMutation.isPending || updateItemMutation.isPending}
                            className="flex items-center gap-2"
                          >
                            {editingItem ? <Save size={16} /> : <Plus size={16} />}
                            {editingItem 
                              ? (updateItemMutation.isPending ? "Updating..." : "Update Item")
                              : (addItemMutation.isPending ? "Adding..." : "Add Item")
                            }
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              if (editingItem) {
                                cancelEdit();
                              } else {
                                setShowAddItem(false);
                              }
                            }}
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
                  {items.sort((a: any, b: any) => a.position - b.position).map((item: any) => (
                    <Card key={item.id} className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-700 dark:text-blue-300">
                            {item.position}
                          </span>
                        </div>
                        
                        {item.image && (
                          <div className="flex-shrink-0">
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          </div>
                        )}
                        
                        <div className="flex-1">
                          <h4 className="font-medium text-lg">{item.title}</h4>
                          {item.description && (
                            <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                          )}
                          {item.link && (
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline mt-2 inline-block"
                            >
                              {item.linkText || "Visit Link"} →
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
                            onClick={() => startEditItem(item)}
                            disabled={editingItem?.id === item.id}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Edit2 size={14} />
                          </Button>
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
                  {items.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
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