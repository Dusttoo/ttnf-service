import React from 'react';
import { Editor } from '@tinymce/tinymce-react';

interface ContentAreaProps {
    content: string;
    setContent: (content: string) => void;
}

const ContentArea: React.FC<ContentAreaProps> = ({ content, setContent }) => {
    const handleEditorChange = (newContent: string) => {
        setContent(newContent);
    };

    return (
        <Editor
            apiKey={process.env.REACT_APP_TINYMCE_API_KEY}
            initialValue={content} 
            value={content} 
            init={{
                height: 500,
                menubar: true,
                plugins: [
                    'advlist autolink lists link image charmap print preview anchor',
                    'searchreplace visualblocks code fullscreen',
                    'insertdatetime media table paste code help wordcount',
                    'image imagetools',
                ],
                toolbar:
                    'undo redo | formatselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help | image',
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