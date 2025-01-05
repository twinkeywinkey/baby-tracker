import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';

const AlertDialog = AlertDialogPrimitive.Root;
const AlertDialogAction = AlertDialogPrimitive.Action;
const AlertDialogCancel = AlertDialogPrimitive.Cancel;

const AlertDialogContent = ({ children, ...props }) => (
  <AlertDialogPrimitive.Portal>
    <AlertDialogPrimitive.Overlay className="fixed inset-0 bg-[#2d3436]/50" />
    <AlertDialogPrimitive.Content
      className="fixed inset-0 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 bg-white sm:rounded-lg sm:max-w-lg w-full sm:max-h-[90vh] h-full sm:h-auto overflow-auto shadow-xl border border-[#dfe6e9]"
      {...props}
    >
      <div className="p-4 sm:p-6">
        {children}
      </div>
    </AlertDialogPrimitive.Content>
  </AlertDialogPrimitive.Portal>
);

const AlertDialogHeader = ({ children }) => (
  <div className="mb-4">{children}</div>
);

const AlertDialogFooter = ({ children }) => (
  <div className="flex justify-end gap-4 mt-4">{children}</div>
);

const AlertDialogTitle = ({ children }) => (
  <AlertDialogPrimitive.Title className="text-lg font-semibold text-[#2d3436]">
    {children}
  </AlertDialogPrimitive.Title>
);

const AlertDialogDescription = ({ children }) => (
  <AlertDialogPrimitive.Description className="text-[#636e72]">
    {children}
  </AlertDialogPrimitive.Description>
);

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
};