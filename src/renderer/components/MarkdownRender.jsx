import ReactMarkdown from 'react-markdown';
import RemarkMathPlugin from 'remark-math';
import RemarkGfmPlugin from 'remark-gfm';
import RehypeKatexPlugin from 'rehype-katex'
import RehypeHighLightPlugin from 'rehype-highlight'
import RehypeSanitizePlugin from 'rehype-sanitize';
import RehypeRaw from 'rehype-raw';
import deepmerge from "deepmerge";
import 'highlight.js/styles/github.css';
import { Typography, TableBody, TableHead, TableRow, TableCell, TableContainer, Table, Paper, List, ListItem, ListItemText } from '@mui/material';

function MarkdownRender(props) {
    const newProps = {
        ...props,
        remarkPlugins: [
            RemarkMathPlugin,
            RemarkGfmPlugin,
        ],
        rehypePlugins: [
            RehypeRaw,
            RehypeKatexPlugin,
            [RehypeHighLightPlugin, {ignoreMissing: true}],
        ],
        components: {
            h1: ({node, ...props}) => <Typography variant="h1" {...props} />,
            h2: ({node, ...props}) => <Typography variant="h2" {...props} />,
            h3: ({node, ...props}) => <Typography variant="h3" {...props} />,
            h4: ({node, ...props}) => <Typography variant="h4" {...props} />,
            h5: ({node, ...props}) => <Typography variant="h5" {...props} />,
            p: ({node, ...props}) => <Typography variant="body1" {...props} />,
            table: ({ children }) => (<TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table size="small">{children}</Table>
            </TableContainer>),
            magic: ({node, ...props}) => {
                return <div {...JSON.parse(props['magic'])} />
            },
            thead: ({node, ...props}) => <TableHead {...props} />,
            tbody: ({node, ...props}) => <TableBody {...props} />,
            tr: ({node, ...props}) => <TableRow {...props} />,
            td: ({ children }) => (<TableCell><Typography>{children}</Typography></TableCell>),
            th: ({ children }) => (<TableCell><Typography style={{fontWeight: 'bold'}}>{children}</Typography></TableCell>),
            ol: ({ children }) => (<List sx={{
              listStyleType: "decimal",
              mt: 2,
              pl: 2,
              "& .MuiListItem-root": {
                display: "list-item",
              },
            }}>{children}</List>),
            ul: ({ children }) => (<List sx={{
              listStyleType: "disc",
              mt: 2,
              pl: 2,
              "& .MuiListItem-root": {
                display: "list-item",
              },
            }}>{children}</List>),
            li: ({ children, ...props }) => (
              <ListItem sx={{ m: 0, p: 0, ml: 2 }} disableGutters><ListItemText
                sx={{ pl: 0.25 }}>{children}</ListItemText></ListItem>),
        }
      };
      return (
        <ReactMarkdown {...newProps} />
      );
}

export default MarkdownRender

