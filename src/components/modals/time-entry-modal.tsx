"use client";

import { format } from "date-fns";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface TimeEntry {
  id: string;
  date: string;
  projectNames: string[];
  taskNames: string[];
  hoursWorked: number[];
  descriptions: string[];
}

interface TimeEntryModalProps {
  selectedEntry: TimeEntry | null;
  onClose: () => void;
}

export function TimeEntryModal({
  selectedEntry,
  onClose,
}: TimeEntryModalProps) {
  return (
    <Transition show={!!selectedEntry} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-lg bg-white p-6 shadow-xl transition-all">
                <div className="relative">
                  <button
                    onClick={onClose}
                    className="absolute right-0 top-0 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>

                  <Dialog.Title className="text-lg font-semibold">
                    Time Entry Details
                  </Dialog.Title>
                  <Dialog.Description className="text-sm text-gray-500 mt-1">
                    {selectedEntry &&
                      format(new Date(selectedEntry.date), "MMMM dd, yyyy")}
                  </Dialog.Description>

                  {selectedEntry && (
                    <div className="space-y-6 mt-6">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Projects</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedEntry.projectNames.map((name, index) => (
                            <Badge key={index} variant="secondary">
                              {name}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium mb-2">
                          Tasks & Hours
                        </h4>
                        <div className="space-y-3">
                          {selectedEntry.taskNames.map((name, index) => (
                            <div
                              key={index}
                              className="flex items-start justify-between p-3 rounded-lg border"
                            >
                              <div className="space-y-1">
                                <Badge variant="outline">{name}</Badge>
                                <p className="text-sm text-gray-500">
                                  {selectedEntry.descriptions[index] ||
                                    "No description provided"}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {selectedEntry.hoursWorked[index]}
                                </span>
                                <Badge variant="secondary" className="text-xs">
                                  hrs
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t">
                        <span className="text-sm text-gray-500">
                          Total Hours
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-semibold">
                            {selectedEntry.hoursWorked.reduce(
                              (a, b) => a + b,
                              0
                            )}
                          </span>
                          <Badge variant="secondary">hrs</Badge>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
