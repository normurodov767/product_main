import API from "@/utils/API";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { message, Modal } from "antd";

// Guruhlarni qidirish (searchGroup) funksiyasi
const searchGroup = async (searchText) => {
  if (!searchText || searchText.length < 2) return [];
  const { data } = await API.get(`/groups/search?q=${searchText}`);
  return data;
}

// A'zolarni qidirish (searchMember) funksiyasi
const searchMember = async (searchText) => {
  if (!searchText || searchText.length < 2) return [];
  const { data } = await API.get(`/users/search?q=${searchText}`);
  return data;
}

// Guruhga qo'shilish (joinGroup) funksiyasi
const joinGroup = async ({ groupId, password }) => {
  if (!groupId || !password) throw new Error("Group ID and password are required");
  const { data } = await API.post(`/groups/${groupId}/join`, { password });
  return data;
};

// Mening guruhlarimni olish (fetchMyGroups) funksiyasi
const fetchMyGroups = async () => {
  const { data } = await API.get("/groups");
  return data;
};

// Guruh yaratish (createGroup) funksiyasi
const createGroup = async ({ name, password }) => {
  if (!name || !password) throw new Error("Group name and password required");
  const { data } = await API.post("/groups", { name, password });
  return data;
};

// Guruhni tark etish (deleteGroup) funksiyasi
const leaveGroup = async (groupId) => {
  if (!groupId) throw new Error("Group ID required");
  const { data } = await API.post(`/groups/${groupId}/leave`);
  return data;
};

// Guruhni o'chirish (deleteGroup) funksiyasi
const deleteGroup = async (groupId) => {
  if (!groupId) throw new Error("Group ID required");
  const { data } = await API.delete(`/groups/${groupId}`);
  return data;
};

// Guruhga foydalanuvchini qo'shish (addMember) funksiyasi
const addMember = async ({ groupId, memberId }) => {
  if (!groupId || !memberId) throw new Error("Group ID and Member ID are required"); 
  const { data } = await API.post(`/groups/${groupId}/members`, { memberId });
  return data;
};

// Guruhdan foydalanuvchini o'chirish (removeMember) funksiyasi
const removeMember = async ({ groupId, memberId }) => {
  if (!groupId || !memberId) throw new Error("Group ID and Member ID are required");
  const { data } = await API.delete(`/groups/${groupId}/members/${memberId}`);
  return data;
};

// Guruhga mahsulot qo'shish (addItemToGroup) funksiyasi
const addItemToGroup = async ({ groupId, itemData }) => {
  const { data } = await API.post(`/items`, { groupId, ...itemData });
  return data;
};

// Guruhdan mahsulotni o'chirish (removeItemFromGroup) funksiyasi
const removeItemFromGroup = async (itemId) => {
  const { data } = await API.delete(`/items/${itemId}`);
  return data;
};

// Mahsulotni sotib olingan deb belgilash funksiyasi
const markItemAsBought = async (itemId) => {
  const { data } = await API.post(`/items/${itemId}/mark-as-bought`);
  return data;
};

// Sotib olingan mahsulotni o'chirish funksiyasi
const removeBoughtItem = async (itemId) => {
  const { data } = await API.delete(`/items/${itemId}/mark-as-bought`);
  return data;
};

// **useGroups** - Guruhlarni qidirish uchun 
const useGroups = (searchText) => {
  const {
    data: groups = [],
    isLoading: isLoadingGroups,
    isError: isErrorGroups,
  } = useQuery({
    queryFn: () => searchGroup(searchText),
    queryKey: searchText.length > 1 ? ["searchGroup", searchText] : ["searchGroup"],
    enabled: searchText.length > 1,
  });
  return { groups, isLoadingGroups, isErrorGroups };
}

// **useMember** - A'zolarni qidirish uchun 
const useMember = (searchText) => {
  const {
    data: members = [],
    isLoading: isLoadingMember,
    isError: isErrorMember,
  } = useQuery({
    queryFn: () => searchMember(searchText),
    queryKey: searchText.length > 1 ? ["searchMember", searchText] : ["searchMember"],
    enabled: searchText.length > 1,
  });
  return { members, isLoadingMember, isErrorMember };
}

// **useJoinGroup** - Guruhga qo'shilish uchun 
const useJoinGroup = () => {
  return useMutation({
    mutationFn: joinGroup,
  });
};

// **useMyGroups** - Mening guruhlarimni olish uchun 
const useMyGroups = () => {
  const {
    data: myGroups = [],
    isLoading: isLoadingMyGroups,
    refetch
  } = useQuery({
    queryFn: fetchMyGroups,
    queryKey: ["myGroups"],
    staleTime: 0,
    cacheTime: 0, 
  });

  return { myGroups, isLoadingMyGroups, refetch };
};

// **useCreateGroup** - Guruh yaratish uchun 
const useCreateGroup = () => {
  const { refetch } = useMyGroups();
  // const navigate = useNavigate();
  return useMutation({
    mutationFn: createGroup,
    onSuccess: async (data) => {
      message.success("The group was successfully created!");
      await refetch();
      // navigate(`/groups/${data._id}`);
    },
    onError: (error) => {
      message.error(`Error: ${error.response?.data?.message || error.message}`);
    },
  });
};

// **useLeaveGroup** - Guruhni tark etish uchun 
const useLeaveGroup = () => {
  return useMutation({
    mutationFn: leaveGroup,
  });
};

// **useDeleteGroup** - Guruhni o'chirish uchun 
const useDeleteGroup = () => {
  return useMutation({
    mutationFn: deleteGroup,
  });
};

// **useConfirmDeleteGroup** - Guruhni tark etishni tasdiqlash uchun 
const useConfirmLeaveGroup = () => {
  const { refetch } = useMyGroups();
  const navigate = useNavigate();
  const { mutate: leaveMutate } = useLeaveGroup();

  const confirmLeaveGroup = (groupId) => {
    Modal.confirm({
      title: "Are you sure you want to leave this group?",
      content: "You will no longer have access to this group.",
      okText: "Yes, Leave",
      okType: "danger",
      cancelText: "Cancel",
      onOk: () => {
        leaveMutate(groupId, {
          onSuccess: () => {
            message.success("You left the group successfully");
            refetch();
            navigate("/");
          },
          onError: (error) => {
            message.error(`Error leaving group: ${error.message}`);
          },
        });
      },
    });
  };
  return confirmLeaveGroup;
};

// **useConfirmDeleteGroup** - Guruhni o'chirishni tasdiqlash uchun
const useConfirmDeleteGroup = () => {
  const { refetch } = useMyGroups();
  const navigate = useNavigate();
  const { mutate: deleteMutate } = useDeleteGroup();

  const confirmDeleteGroup = (groupId) => {
    Modal.confirm({
      title: "Are you sure you want to delete this group?",
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: () => {
        deleteMutate(groupId, {
          onSuccess: () => {
            message.success("Group deleted successfully");
            refetch();
            navigate("/");
          },
          onError: (error) => {
            message.error(`Error deleting group: ${error.message}`);
          },
        });
      },
    });
  };
  return confirmDeleteGroup;
};

// **useAddMember** - Guruhga foydalanuvchini qo'shish uchun
const useAddMember = () => {
  const { refetch } = useMyGroups();

  return useMutation({
    mutationFn: addMember,
    onSuccess: async (data) => {
      message.success("Member successfully added to the group!");
      await refetch(); 
    },
    onError: (error) => {
      message.error(`Error adding member: ${error.response?.data?.message || error.message}`);
    },
  });
};

// **useRemoveMember** - Guruhdan foydalanuvchini o'chirish uchun
const useRemoveMember = () => {
  const { refetch } = useMyGroups();
  return useMutation({
    mutationFn: removeMember,
    onSuccess: async () => { 
      message.success("Member removed successfully!");
      await refetch();
    },
    onError: (error) => {
      message.error(`Error removing member: ${error.response?.data?.message || error.message}`);
    },
  });
};

// **useGroupItems** - Guruh mahsulotlarini boshqarish  l
const useGroupItems = () => {
  const queryClient = useQueryClient();
  return {
    addItemMutation: useMutation({
      mutationFn: addItemToGroup,
      onSuccess: () => {
        message.success("Product added successfully!");
        queryClient.invalidateQueries("groupItems"); 
      },
      onError: (error) => message.error(`Error: ${error.message}`),
    }),
    removeItemMutation: useMutation({
      mutationFn: removeItemFromGroup,
      onSuccess: () => {
        message.success("The item was successfully deleted!");
        queryClient.invalidateQueries("groupItems"); 
      },
      onError: (error) => message.error(`Error: ${error.message}`),
    }),
    removeBoughtItemMutation: useMutation({
      mutationFn: removeBoughtItem,
      onSuccess: () =>{ message.success("The item was successfully deleted!");
      queryClient.invalidateQueries("groupItems");
      },
      onError: (error) => message.error(`Error: ${error.message}`),
    }),
    markItemAsBoughtMutation: useMutation({
      mutationFn: markItemAsBought,
      onSuccess: () => {
        message.success("Product purchased!");
        queryClient.invalidateQueries("groupItems");
      },
      onError: (error) => message.error(`Error: ${error.message}`),
    }),
  };
};


export {
  useGroups,
  useMember,
  useJoinGroup,
  useMyGroups,
  useDeleteGroup,
  useCreateGroup,
  useConfirmLeaveGroup,
  useConfirmDeleteGroup,
  useAddMember,
  useRemoveMember,
  useGroupItems,
};