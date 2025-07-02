import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // Import the styles
import { Box, Button, Input, useColorMode, useToast } from "@chakra-ui/react";
import { useState } from "react";
import admin from "../../Controllers/admin";
import { ADD } from "../../Controllers/ApiControllers";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import ShowToast from "../../Controllers/ShowToast";
import Loading from "../../Components/Loading";

const handleUpdate = async (data) => {
  const res = await ADD(admin.token, "update_web_page", data);
  if (res.response !== 200) {
    throw new Error(res.message);
  }
  return res.data;
};

// eslint-disable-next-line react/prop-types
const WysiwygEditor = ({ value }) => {
  const [editorContent, setEditorContent] = useState(value);
  const queryClient = useQueryClient();
  const toast = useToast();
  const { colorMode } = useColorMode(); // Use color mode hook

  const modules = {
    toolbar: [
      [{ font: [] }],
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ color: [] }, { background: [] }],
      [{ script: "sub" }, { script: "super" }],
      ["blockquote", "code-block"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ indent: "-1" }, { indent: "+1" }],
      [{ direction: "rtl" }],
      [{ align: [] }],
      ["link"],
      ["clean"], // remove formatting button
    ],
  };

  const mutation = useMutation({
    mutationFn: async () => {
      let data = editorContent;
      await handleUpdate(data);
    },
    onError: (error) => {
      
      ShowToast(toast, "error", error.message);
    },
    onSuccess: () => {
      ShowToast(toast, "success", "Success");
      queryClient.invalidateQueries(["page", editorContent.page_id]);
    },
  });

  if (mutation.isPending) return <Loading />;

  return (
    <Box>
      <Input
        value={editorContent?.title}
        placeholder="Page Title"
        mb={5}
        onChange={(e) => {
          setEditorContent({ ...editorContent, title: e.target.value });
        }}
      />
      <ReactQuill
        value={editorContent?.body}
        onChange={(value) => {
          setEditorContent({ ...editorContent, body: value });
        }}
        theme="snow"
        modules={modules}
        style={{
          color: colorMode === "dark" ? "#E2E8F0" : "#1A202C",
        }}
      />
      <Button
        w={"100%"}
        mt={5}
        colorScheme={"blue"}
        size={"sm"}
        onClick={() => {
          mutation.mutate();
        }}
        isLoading={mutation.isPending}
      >
        Update
      </Button>
    </Box>
  );
};

export default WysiwygEditor;
