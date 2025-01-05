import * as DialogPrimitive from '@radix-ui/react-dialog';

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;

const DialogContent = ({ children, ...props }) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 bg-[#2d3436]/50" />
    <DialogPrimitive.Content
      className="fixed inset-0 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 bg-white sm:rounded-lg sm:max-w-lg w-full sm:max-h-[90vh] h-full sm:h-auto overflow-auto shadow-xl border border-[#dfe6e9]"
      {...props}
    >
      <div className="p-4 sm:p-6">
        {children}
      </div>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
);

const DialogHeader = ({ children }) => (
  <div className="mb-4">{children}</div>
);

const DialogTitle = ({ children }) => (
  <DialogPrimitive.Title className="text-lg font-semibold text-[#2d3436]">
    {children}
  </DialogPrimitive.Title>
);

export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle };