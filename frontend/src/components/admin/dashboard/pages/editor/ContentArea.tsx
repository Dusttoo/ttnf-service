import React from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { theme } from '../../../../../theme/theme';

interface ContentAreaProps {
  content: string;
  setContent: (content: string) => void;
  height?: number; // Allow height customization
  toolbarOptions?: string; // Customize toolbar options for different use cases
  plugins?: string[]; // Allow passing different plugins based on usage
  placeholder?: string; // Placeholder for empty content
}

const ContentArea: React.FC<ContentAreaProps> = ({
  content,
  setContent,
  height = 500, // Default height
  toolbarOptions = 'undo redo | formatselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help | image',
  plugins = [
    'advlist autolink lists link image charmap print preview anchor',
    'searchreplace visualblocks code fullscreen',
    'insertdatetime media table paste code help wordcount',
    'image imagetools',
  ],
  placeholder = 'Start writing here...', // Default placeholder text
}) => {
  const handleEditorChange = (newContent: string) => {
    setContent(newContent);
  };

  const styleString =
    "body { background-color: #1F1F1F; color: #E0E0E0; font-family: 'Roboto', Arial, sans-serif; line-height: 1.6; } p { color: #E0E0E0; margin-bottom: 1em; } h1, h2, h3, h4, h5, h6 { color: #E76F00; font-family: 'Oswald', sans-serif; } a { color: #a84824; text-decoration: underline; } a:hover { color: #E76F00; } ul, ol { color: #E0E0E0; } ul li::marker, ol li::marker { color: #E76F00; } blockquote { color: #A0A0A0; border-left: 4px solid #E76F00; padding-left: 1em; margin-left: 0; } pre { background-color: #393939; padding: 1em; color: #E0E0E0; border-radius: 4px; } code { background-color: #4A4A4A; padding: 0.2em 0.4em; border-radius: 3px; color: #F8F9EE; } button { background-color: #E76F00; color: #F8F9EE; padding: 0.4em 0.8em; border: none; border-radius: 3px; } button:hover { background-color: #a84824; color: #F8F9EE; } table { border-collapse: collapse; width: 100%; background-color: #393939; color: #E0E0E0; } th, td { border: 1px solid #4A4A4A; padding: 0.5em; } th { background-color: #2D2D2D; color: #F8F9EE; } td { background-color: #4A4A4A; } .tox-statusbar, .tox .tox-statusbar__path-item, .tox-toolbar__group, .tox-toolbar__primary { background-color: #2D2D2D; color: #F8F9EE; } .tox .tox-mbtn__select-chevron, .tox .tox-tbtn__icon-wrap svg { fill: #E76F00; } .tox-tbtn:hover .tox-tbtn__icon-wrap svg { fill: #a84824; }";

  return (
    <Editor
      apiKey={process.env.REACT_APP_TINYMCE_API_KEY}
      value={content}
      init={{
        height,
        menubar: true,
        plugins,
        toolbar: toolbarOptions,
        placeholder,
        content_style: styleString,
        image_title: true,
        automatic_uploads: true,
        file_picker_types: 'image',
        file_picker_callback: (cb, value, meta) => {
          const input = document.createElement('input');
          input.setAttribute('type', 'file');
          input.setAttribute('accept', 'image/*');

          input.onchange = function (event: Event) {
            const target = event.target as HTMLInputElement;
            if (target.files && target.files[0]) {
              const file = target.files[0];
              const reader = new FileReader();

              reader.onload = function () {
                if (reader.result) {
                  const id = 'blobid' + new Date().getTime();
                  const blobInfo = {
                    id,
                    file,
                    src: URL.createObjectURL(file),
                  };
                  cb(blobInfo.src, { title: file.name });
                }
              };

              reader.readAsDataURL(file);
            }
          };

          input.click();
        },
      }}
      onEditorChange={handleEditorChange}
    />
  );
};

export default ContentArea;
